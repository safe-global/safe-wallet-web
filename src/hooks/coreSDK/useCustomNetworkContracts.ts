import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useCurrentChain } from '../useChains'
import type { ContractNetworkConfig, ContractNetworksConfig } from '@safe-global/protocol-kit'
import { IS_OFFICIAL_HOST, IS_PRODUCTION } from '@/config/constants'

const isContractNetworksConfig = (obj: Omit<ChainInfo['contractAddresses'], 'safeWebAuthnSignerFactoryAddress'>) => {
  return Object.values(obj).every((value) => !!value)
}

export const useCustomNetworkContracts = () => {
  const currentChain = useCurrentChain()
  if (!currentChain || (IS_PRODUCTION && IS_OFFICIAL_HOST)) return

  const { safeWebAuthnSignerFactoryAddress, ...contractAddresses } = currentChain.contractAddresses

  if (!isContractNetworksConfig(contractAddresses)) return
  return contractAddresses as ContractNetworkConfig
}

export const useCustomNetworksConfig = () => {
  const customNetworkContracts = useCustomNetworkContracts()
  const currentChain = useCurrentChain()

  if (!currentChain || !customNetworkContracts) return

  return { [currentChain.chainId]: customNetworkContracts } as ContractNetworksConfig
}

// export default useCustomNetworkContracts

// export const getContractNetworksConfig = (chain: ChainInfo | undefined) => {
//   if (!chain || (IS_PRODUCTION && IS_OFFICIAL_HOST)) return

//   // Exclude safeWebAuthnSignerFactoryAddress as it is not yet supported
//   const { safeWebAuthnSignerFactoryAddress, ...contractAddresses } = chain.contractAddresses

//   if (!isContractNetworksConfig({ [chain.chainId]: contractAddresses })) return
//   return { [chain.chainId]: contractAddresses }
// }
