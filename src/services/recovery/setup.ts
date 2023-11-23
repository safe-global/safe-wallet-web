import { OperationType } from '@safe-global/safe-core-sdk-types'
import { SENTINEL_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { getModuleInstance, KnownContracts, deployAndSetUpModule } from '@gnosis.pm/zodiac'
import { Interface } from 'ethers/lib/utils'
import type { Web3Provider } from '@ethersproject/providers'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

import { sameAddress } from '@/utils/addresses'
import { MAX_GUARDIAN_PAGE_SIZE } from './recovery-state'
import type { UpsertRecoveryFlowProps } from '@/components/tx-flow/flows/UpsertRecovery'

export function _getRecoverySetupTransactions({
  txCooldown,
  txExpiration,
  guardians,
  chainId,
  safeAddress,
  provider,
}: {
  txCooldown: string
  txExpiration: string
  guardians: Array<string>
  chainId: string
  safeAddress: string
  provider: Web3Provider
}): {
  expectedModuleAddress: string
  transactions: Array<MetaTransactionData>
} {
  const setupArgs: Parameters<typeof deployAndSetUpModule>[1] = {
    types: ['address', 'address', 'address', 'uint256', 'uint256'],
    values: [
      safeAddress, // address _owner
      safeAddress, // address _avatar
      safeAddress, // address _target
      txCooldown, // uint256 _cooldown
      txExpiration, // uint256 _expiration
    ],
  }

  const saltNonce: Parameters<typeof deployAndSetUpModule>[4] = Date.now().toString()

  const { transaction, expectedModuleAddress } = deployAndSetUpModule(
    KnownContracts.DELAY,
    setupArgs,
    provider,
    Number(chainId),
    saltNonce,
  )

  const transactions: Array<MetaTransactionData> = []

  // Deploy Delay Modifier
  const deployDeplayModifier: MetaTransactionData = {
    ...transaction,
    value: transaction.value.toString(),
  }

  transactions.push(deployDeplayModifier)

  const safeAbi = ['function enableModule(address module)']
  const safeInterface = new Interface(safeAbi)

  // Enable Delay Modifier on Safe
  const enableDelayModifier: MetaTransactionData = {
    to: safeAddress,
    value: '0',
    data: safeInterface.encodeFunctionData('enableModule', [expectedModuleAddress]),
  }

  transactions.push(enableDelayModifier)

  const delayModifierContract = getModuleInstance(KnownContracts.DELAY, expectedModuleAddress, provider)

  // Add guardians to Delay Modifier
  const enableDelayModifierModules: Array<MetaTransactionData> = guardians.map((guardian) => {
    return {
      to: expectedModuleAddress,
      data: delayModifierContract.interface.encodeFunctionData('enableModule', [guardian]),
      value: '0',
    }
  })

  transactions.push(...enableDelayModifierModules)

  return {
    expectedModuleAddress,
    transactions,
  }
}

export async function _getEditRecoveryTransactions({
  newTxCooldown,
  newTxExpiration,
  newGuardians,
  moduleAddress,
  provider,
}: {
  newTxCooldown: string
  newTxExpiration: string
  newGuardians: Array<string>
  moduleAddress: string
  provider: Web3Provider
}): Promise<Array<MetaTransactionData>> {
  const delayModifierContract = getModuleInstance(KnownContracts.DELAY, moduleAddress, provider)

  const [txExpiration, txCooldown, [guardians]] = await Promise.all([
    delayModifierContract.txExpiration(),
    delayModifierContract.txCooldown(),
    delayModifierContract.getModulesPaginated(SENTINEL_ADDRESS, MAX_GUARDIAN_PAGE_SIZE),
  ])

  // Recovery management transaction data
  const txData: Array<string> = []

  // Update cooldown
  if (!txCooldown.eq(newTxCooldown)) {
    const setTxCooldown = delayModifierContract.interface.encodeFunctionData('setTxCooldown', [newTxCooldown])
    txData.push(setTxCooldown)
  }

  // Update expiration
  if (!txExpiration.eq(newTxExpiration)) {
    const setTxExpiration = delayModifierContract.interface.encodeFunctionData('setTxExpiration', [newTxExpiration])
    txData.push(setTxExpiration)
  }

  // Cache guardian changes to determine prevModule
  let _guardians = [...guardians]

  // Don't add/remove same owners
  const guardiansToAdd = newGuardians.filter(
    (newGuardian) => !_guardians.some((oldGuardian) => sameAddress(oldGuardian, newGuardian)),
  )
  const guardiansToRemove = _guardians.filter(
    (oldGuardian) => !newGuardians.some((newGuardian) => sameAddress(newGuardian, oldGuardian)),
  )

  for (const guardianToAdd of guardiansToAdd) {
    const enableModule = delayModifierContract.interface.encodeFunctionData('enableModule', [guardianToAdd])
    txData.push(enableModule)

    // Need not add guardian to cache as not relevant for prevModule
  }

  for (const guardianToRemove of guardiansToRemove) {
    const prevModule = (() => {
      const guardianIndex = _guardians.findIndex((guardian) => sameAddress(guardian, guardianToRemove))
      return guardianIndex === 0 ? SENTINEL_ADDRESS : _guardians[guardianIndex - 1]
    })()
    const disableModule = delayModifierContract.interface.encodeFunctionData('disableModule', [
      prevModule,
      guardianToRemove,
    ])
    txData.push(disableModule)

    // Remove guardian from cache
    _guardians = _guardians.filter((guardian) => !sameAddress(guardian, guardianToRemove))
  }

  return txData.map((data) => ({
    to: moduleAddress,
    value: '0',
    operation: OperationType.Call,
    data,
  }))
}

export async function getRecoveryUpsertTransactions({
  txCooldown,
  txExpiration,
  guardian,
  provider,
  moduleAddress,
  chainId,
  safeAddress,
}: UpsertRecoveryFlowProps & {
  moduleAddress?: string
  provider: Web3Provider
  chainId: string
  safeAddress: string
}): Promise<Array<MetaTransactionData>> {
  if (moduleAddress) {
    return _getEditRecoveryTransactions({
      moduleAddress,
      newTxCooldown: txCooldown,
      newTxExpiration: txExpiration,
      newGuardians: [guardian],
      provider,
    })
  }

  const { transactions } = _getRecoverySetupTransactions({
    txCooldown,
    txExpiration,
    guardians: [guardian],
    chainId,
    safeAddress,
    provider,
  })

  return transactions
}
