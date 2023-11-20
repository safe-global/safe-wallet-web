import { getModuleInstance, KnownContracts, deployAndSetUpModule } from '@gnosis.pm/zodiac'
import { Interface } from 'ethers/lib/utils'
import type { Web3Provider } from '@ethersproject/providers'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

export function getRecoverySetup({
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
