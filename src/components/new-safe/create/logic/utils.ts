import { computeNewSafeAddress } from '@/components/new-safe/create/logic/index'
import { isSmartContract } from '@/utils/wallets'
import type { ContractNetworkConfig, DeploySafeProps } from '@safe-global/protocol-kit'
import type { Eip1193Provider } from 'ethers'

export const getAvailableSaltNonce = async (
  provider: Eip1193Provider,
  props: DeploySafeProps,
  chainId: string,
  contractAddresses?: ContractNetworkConfig,
): Promise<string> => {
  const safeAddress = await computeNewSafeAddress(provider, props, chainId, contractAddresses)
  const isContractDeployed = await isSmartContract(safeAddress)

  // Safe is already deployed so we try the next saltNonce
  if (isContractDeployed) {
    return getAvailableSaltNonce(
      provider,
      { ...props, saltNonce: (Number(props.saltNonce) + 1).toString() },
      chainId,
      contractAddresses,
    )
  }

  // We know that there will be a saltNonce but the type has it as optional
  return props.saltNonce!
}
