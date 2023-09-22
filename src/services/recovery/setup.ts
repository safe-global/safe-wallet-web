import { getModuleInstance, KnownContracts, deployAndSetUpModule } from '@gnosis.pm/zodiac'
import { Interface } from 'ethers/lib/utils'
import type { Web3Provider } from '@ethersproject/providers'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

export function getRecoverySetup({
  txCooldown,
  txExpiration,
  recoverers,
  safe,
  provider,
}: {
  txCooldown: string
  txExpiration: string
  recoverers: Array<string>
  safe: SafeInfo
  provider: Web3Provider
}): {
  expectedModuleAddress: string
  transactions: Array<MetaTransactionData>
} {
  const safeAddress = safe.address.value

  const setupArgs = {
    types: ['address', 'address', 'address', 'uint256', 'uint256'],
    values: [
      safeAddress, // address _owner
      safeAddress, // address _avatar
      safeAddress, // address _target
      txCooldown, // uint256 _cooldown
      txExpiration, // uint256 _expiration
    ],
  }

  const saltNonce = Date.now().toString()

  const { transaction, expectedModuleAddress } = deployAndSetUpModule(
    KnownContracts.DELAY,
    setupArgs,
    provider,
    Number(safe.chainId),
    saltNonce,
  )

  const transactions: Array<MetaTransactionData> = []

  // Deploy Delay Modifier
  const deployDeplayModifier: MetaTransactionData = {
    ...transaction,
    value: transaction.value.toString(),
  }

  transactions.push(deployDeplayModifier)

  // Don't call as don't need to check nonce, etc.
  const safeInterface = new Interface(['function enableModule(address module)'])

  // Enable Delay Modifier on Safe
  const enableDelayModifier: MetaTransactionData = {
    to: safeAddress,
    value: '0',
    data: safeInterface.encodeFunctionData('enableModule', [expectedModuleAddress]),
  }

  transactions.push(enableDelayModifier)

  // Setup recovery method
  const delayModifierContract = getModuleInstance(KnownContracts.DELAY, expectedModuleAddress, provider)

  // Add recoverers directly to Delay Modifier
  const enableDelayModifierModules: Array<MetaTransactionData> = recoverers.map((module) => {
    return {
      to: expectedModuleAddress,
      data: delayModifierContract.interface.encodeFunctionData('enableModule', [module]),
      value: '0',
    }
  })

  transactions.push(...enableDelayModifierModules)

  return {
    expectedModuleAddress,
    transactions,
  }
}
