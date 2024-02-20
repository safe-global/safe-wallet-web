import { computeNewSafeAddress } from '@/components/new-safe/create/logic/index'
import { isSmartContract } from '@/hooks/wallets/web3'
import type { DeploySafeProps } from '@safe-global/protocol-kit'
import type { SafeVersion } from '@safe-global/safe-core-sdk-types'
import type { BrowserProvider } from 'ethers'

export const getAvailableSaltNonce = async (
  provider: BrowserProvider,
  props: DeploySafeProps,
  safeVersion?: SafeVersion,
): Promise<string> => {
  const safeAddress = await computeNewSafeAddress(provider, props, safeVersion)
  const isContractDeployed = await isSmartContract(provider, safeAddress)

  // Safe is already deployed so we try the next saltNonce
  if (isContractDeployed) {
    return getAvailableSaltNonce(
      provider,
      { ...props, saltNonce: (Number(props.saltNonce) + 1).toString() },
      safeVersion,
    )
  }

  // We know that there will be a saltNonce but the type has it as optional
  return props.saltNonce!
}
