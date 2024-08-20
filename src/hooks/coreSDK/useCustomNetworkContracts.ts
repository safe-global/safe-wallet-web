import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useCurrentChain } from '../useChains'
import type { ContractNetworkConfig, ContractNetworksConfig } from '@safe-global/protocol-kit'
import { IS_OFFICIAL_HOST, IS_PRODUCTION } from '@/config/constants'

const isContractNetworkConfig = (obj: Omit<ChainInfo['contractAddresses'], 'safeWebAuthnSignerFactoryAddress'>) => {
  return Object.values(obj).every((value) => !!value)
}

/**
 * Get deployed safe contract addresses from the config service.
 * To be used when the addresses are not available from safe-deployments
 */
export const useCustomNetworkContracts = () => {
  const currentChain = useCurrentChain()
  if (!currentChain || (IS_PRODUCTION && IS_OFFICIAL_HOST)) return

  // Exclude safeWebAuthnSignerFactoryAddress as it is not yet supported.
  const { safeWebAuthnSignerFactoryAddress, ...contractAddresses } = currentChain.contractAddresses

  if (!isContractNetworkConfig(contractAddresses)) return
  return contractAddresses as ContractNetworkConfig
}

export const useCustomNetworksContracts = () => {
  const customNetworkContracts = useCustomNetworkContracts()
  const currentChain = useCurrentChain()

  if (!currentChain || !customNetworkContracts) return

  return { [currentChain.chainId]: customNetworkContracts } as ContractNetworksConfig
}
