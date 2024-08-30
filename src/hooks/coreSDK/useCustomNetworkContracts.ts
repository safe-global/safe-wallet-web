import { useCurrentChain } from '../useChains'
import type { ContractNetworkConfig, ContractNetworksConfig } from '@safe-global/protocol-kit'
import { IS_OFFICIAL_HOST, IS_PRODUCTION } from '@/config/constants'

/**
 * Get deployed safe contract addresses from the config service.
 * To be used when the addresses are not available from safe-deployments
 */

export const useCustomNetworkContracts =
  IS_PRODUCTION && IS_OFFICIAL_HOST
    ? () => undefined
    : () => {
        const currentChain = useCurrentChain()
        if (!currentChain) return

        // Exclude safeWebAuthnSignerFactoryAddress as it is not yet supported.
        const { safeWebAuthnSignerFactoryAddress, ...contractAddresses } = currentChain.contractAddresses

        const customContractsDefined = Object.values(contractAddresses).every((value) => !!value)
        if (!customContractsDefined) return

        return contractAddresses as ContractNetworkConfig
      }

export const useCustomContractsByNetwork = () => {
  const customNetworkContracts = useCustomNetworkContracts()
  const currentChain = useCurrentChain()

  if (!currentChain || !customNetworkContracts) return

  return { [currentChain.chainId]: customNetworkContracts } as ContractNetworksConfig
}
