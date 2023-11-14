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
  const INTERMEDIARY_THRESHOLD = 1

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
  const ownersToRemove = safe.owners.filter(
    (oldOwner) => !newOwners.some((newOwner) => sameAddress(newOwner.value, oldOwner.value)),
  )

  // Check whether threshold should be changed after owner management
  let changeThreshold = newThreshold !== safe.threshold

  const txData: Array<string> = []

  const length = Math.max(ownersToAdd.length, ownersToRemove.length)

  for (let index = 0; index < length; index++) {
    const ownerToAdd = ownersToAdd[index]?.value
    const ownerToRemove = ownersToRemove[index]?.value

    const ownerIndex = _owners.findIndex((owner) => sameAddress(owner.value, ownerToRemove))
    const prevOwner = ownerIndex === 0 ? SENTINEL_ADDRESS : _owners[ownerIndex - 1]?.value

    // Swap owner if possible
    if (ownerToRemove && ownerToAdd) {
      txData.push(safeInterface.encodeFunctionData('swapOwner', [prevOwner, ownerToRemove, ownerToAdd]))

      // Update cache to reflect swap
      _owners = _owners.map((owner) => {
        if (sameAddress(owner.value, ownerToRemove)) {
          return ownersToAdd[index]
        }
        return owner
      })
      continue
    }

    // Add or remove owner, finally setting threshold (intermediary value prevents threshold > owner length)
    const threshold = index === length - 1 ? newThreshold : INTERMEDIARY_THRESHOLD

    if (!ownerToRemove) {
      txData.push(safeInterface.encodeFunctionData('addOwnerWithThreshold', [ownerToAdd, threshold]))

      // Update cache to reflect addition
      _owners.push(ownersToAdd[index])
    } else {
      txData.push(safeInterface.encodeFunctionData('removeOwner', [prevOwner, ownerToRemove, threshold]))

      // Update cache to reflect removal
      _owners = _owners.filter((owner) => !sameAddress(owner.value, ownerToRemove))
    }

    changeThreshold = false
  }

  // If only swapOwners exist but there is a threshold change, changeThreshold
  if (changeThreshold) {
    txData.push(safeInterface.encodeFunctionData('changeThreshold', [newThreshold]))
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

  return {
    to: multiSendDeployment.networkAddresses[safe.chainId] ?? multiSendDeployment.defaultAddress,
    value: '0',
    operation: OperationType.Call,
    data: encodeMultiSendData(transactions),
  }
}
