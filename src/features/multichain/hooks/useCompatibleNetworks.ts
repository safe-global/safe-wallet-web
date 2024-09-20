import { type ReplayedSafeProps } from '@/features/counterfactual/store/undeployedSafesSlice'
import useChains from '@/hooks/useChains'
import { sameAddress } from '@/utils/addresses'
import { type SafeVersion } from '@safe-global/safe-core-sdk-types'
import {
  type SingletonDeploymentV2,
  getProxyFactoryDeployments,
  getSafeL2SingletonDeployments,
  getSafeSingletonDeployments,
} from '@safe-global/safe-deployments'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

const SUPPORTED_VERSIONS: SafeVersion[] = ['1.4.1', '1.3.0']

const hasDeployment = (chainId: string, contractAddress: string, deployments: SingletonDeploymentV2[]) => {
  return deployments.some((deployment) => {
    // Check that deployment contains the contract Address on given chain
    const networkDeployments = deployment.networkAddresses[chainId]
    return Array.isArray(networkDeployments)
      ? networkDeployments.some((networkDeployment) => sameAddress(networkDeployment, contractAddress))
      : sameAddress(networkDeployments, contractAddress)
  })
}

/**
 * Returns all chains where the creations's masterCopy and factory are deployed.
 * @param creation
 */
export const useCompatibleNetworks = (
  creation: ReplayedSafeProps | undefined,
): (ChainInfo & { available: boolean })[] => {
  const { configs } = useChains()

  if (!creation) {
    return []
  }

  const { masterCopy, factoryAddress } = creation

  const allL1SingletonDeployments = SUPPORTED_VERSIONS.map((version) =>
    getSafeSingletonDeployments({ version }),
  ).filter(Boolean) as SingletonDeploymentV2[]

  const allL2SingletonDeployments = SUPPORTED_VERSIONS.map((version) =>
    getSafeL2SingletonDeployments({ version }),
  ).filter(Boolean) as SingletonDeploymentV2[]

  const allProxyFactoryDeployments = SUPPORTED_VERSIONS.map((version) =>
    getProxyFactoryDeployments({ version }),
  ).filter(Boolean) as SingletonDeploymentV2[]

  return configs.map((config) => {
    return {
      ...config,
      available:
        (hasDeployment(config.chainId, masterCopy, allL1SingletonDeployments) ||
          hasDeployment(config.chainId, masterCopy, allL2SingletonDeployments)) &&
        hasDeployment(config.chainId, factoryAddress, allProxyFactoryDeployments),
    }
  })
}
