import { computeNewSafeAddress } from '@/components/new-safe/create/logic/index'
import { isSmartContract } from '@/utils/wallets'
import type { DeploySafeProps } from '@safe-global/protocol-kit'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { Eip1193Provider } from 'ethers'

export const getAvailableSaltNonce = async (
  provider: Eip1193Provider,
  props: DeploySafeProps,
  chainInfo: ChainInfo,
  is4337: boolean,
): Promise<string> => {
  const safeAddress = await computeNewSafeAddress(provider, props, chainInfo, is4337)
  const isContractDeployed = await isSmartContract(safeAddress)

  // Safe is already deployed so we try the next saltNonce
  if (isContractDeployed) {
    return getAvailableSaltNonce(
      provider,
      { ...props, saltNonce: (Number(props.saltNonce) + 1).toString() },
      chainInfo,
      is4337,
    )
  }

  // We know that there will be a saltNonce but the type has it as optional
  return props.saltNonce!
}
