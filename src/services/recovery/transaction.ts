import { Interface } from 'ethers/lib/utils'
import { getMultiSendCallOnlyDeployment, getSafeSingletonDeployment } from '@safe-global/safe-deployments'
import { SENTINEL_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { encodeMultiSendData } from '@safe-global/safe-core-sdk/dist/src/utils/transactions/utils'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import type { AddressEx, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { sameAddress } from '@/utils/addresses'

export function getRecoveryProposalTransactions({
  safe,
  newThreshold,
  newOwners,
}: {
  safe: SafeInfo
  newThreshold: number
  newOwners: Array<AddressEx>
}): Array<MetaTransactionData> {
  const safeDeployment = getSafeSingletonDeployment({ network: safe.chainId, version: safe.version ?? undefined })

  if (!safeDeployment) {
    throw new Error('Safe deployment not found')
  }

  const safeInterface = new Interface(safeDeployment.abi)

  // Cache owner changes to determine prevOwner
  let _owners = [...safe.owners]

  // Don't add/remove same owners
  const ownersToAdd = newOwners.filter(
    (newOwner) => !_owners.some((oldOwner) => sameAddress(oldOwner.value, newOwner.value)),
  )
  const ownersToRemove = _owners.filter(
    (oldOwner) => !newOwners.some((newOwner) => sameAddress(newOwner.value, oldOwner.value)),
  )

  // Check whether threshold should be changed after owner management
  let changeThreshold = newThreshold !== safe.threshold

  // Owner management transaction data
  const txData: Array<string> = []

  // Minimum number of owner management transactions required
  const length = Math.max(ownersToAdd.length, ownersToRemove.length)

  // Iterate of existing/new owners and swap, add, remove accordingly
  for (let index = 0; index < length; index++) {
    const ownerToAdd = ownersToAdd[index]?.value
    const ownerToRemove = ownersToRemove[index]?.value

    const prevOwner = (() => {
      const ownerIndex = _owners.findIndex((owner) => sameAddress(owner.value, ownerToRemove))
      return ownerIndex === 0 ? SENTINEL_ADDRESS : _owners[ownerIndex - 1]?.value
    })()

    // Swap existing owner with new one
    if (ownerToRemove && ownerToAdd) {
      const swapOwner = safeInterface.encodeFunctionData('swapOwner', [prevOwner, ownerToRemove, ownerToAdd])
      txData.push(swapOwner)

      // Swap owner in cache
      _owners = _owners.map((owner) => (sameAddress(owner.value, ownerToRemove) ? ownersToAdd[index] : owner))

      continue
    }

    const threshold = (() => {
      const newOwnerLength = ownerToAdd ? _owners.length + 1 : _owners.length - 1
      // Prevent intermediary threshold > number of owners
      return index === length - 1 ? newThreshold : newThreshold > newOwnerLength ? newOwnerLength : newThreshold
    })()

    // Add new owner and set threshold
    if (ownerToAdd) {
      const addOwnerWithThreshold = safeInterface.encodeFunctionData('addOwnerWithThreshold', [ownerToAdd, threshold])
      txData.push(addOwnerWithThreshold)

      // Add owner to cache
      _owners.push({ value: ownerToAdd })
    }
    // Remove existing owner and set threshold
    else {
      const removeOwner = safeInterface.encodeFunctionData('removeOwner', [prevOwner, ownerToRemove, threshold])
      txData.push(removeOwner)

      // Remove owner from cache
      _owners = _owners.filter((owner) => !sameAddress(owner.value, ownerToRemove))
    }

    // addOwnerWithThreshold/removeOwner changed threshold
    changeThreshold = false
  }

  // Only swapOwner will be called
  if (changeThreshold) {
    txData.push(safeInterface.encodeFunctionData('changeThreshold', [newThreshold]))
  }

  if (newThreshold > _owners.length) {
    throw new Error('New threshold is higher than desired owners')
  }

  return txData.map((data) => ({
    to: safe.address.value,
    value: '0',
    operation: OperationType.Call,
    data,
  }))
}

export function getRecoveryProposalTransaction({
  safe,
  newThreshold,
  newOwners,
}: {
  safe: SafeInfo
  newThreshold: number
  newOwners: Array<AddressEx>
}): MetaTransactionData {
  const transactions = getRecoveryProposalTransactions({ safe, newThreshold, newOwners })

  if (transactions.length === 0) {
    throw new Error('No recovery transactions found')
  }

  if (transactions.length === 1) {
    return transactions[0]
  }

  const multiSendDeployment = getMultiSendCallOnlyDeployment({
    network: safe.chainId,
    version: safe.version ?? undefined,
  })

  if (!multiSendDeployment) {
    throw new Error('MultiSend deployment not found')
  }

  const multiSendInterface = new Interface(multiSendDeployment.abi)
  const multiSendData = encodeMultiSendData(transactions)

  return {
    to: multiSendDeployment.networkAddresses[safe.chainId] ?? multiSendDeployment.defaultAddress,
    value: '0',
    operation: OperationType.Call,
    data: multiSendInterface.encodeFunctionData('multiSend', [multiSendData]),
  }
}
