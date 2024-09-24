import { type ReplayedSafeProps } from '@/features/counterfactual/store/undeployedSafesSlice'
import useChains from '@/hooks/useChains'
import { hasMatchingDeployment } from '@/services/contracts/deployments'
import { type SafeVersion } from '@safe-global/safe-core-sdk-types'
import {
  getCompatibilityFallbackHandlerDeployments,
  getProxyFactoryDeployments,
  getSafeL2SingletonDeployments,
  getSafeSingletonDeployments,
} from '@safe-global/safe-deployments'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

const SUPPORTED_VERSIONS: SafeVersion[] = ['1.4.1', '1.3.0']

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

  const { masterCopy, factoryAddress, safeAccountConfig } = creation

  const { fallbackHandler } = safeAccountConfig

  return configs.map((config) => {
    return {
      ...config,
      available:
        (hasMatchingDeployment(getSafeSingletonDeployments, masterCopy, config.chainId, SUPPORTED_VERSIONS) ||
          hasMatchingDeployment(getSafeL2SingletonDeployments, masterCopy, config.chainId, SUPPORTED_VERSIONS)) &&
        hasMatchingDeployment(getProxyFactoryDeployments, factoryAddress, config.chainId, SUPPORTED_VERSIONS) &&
        hasMatchingDeployment(
          getCompatibilityFallbackHandlerDeployments,
          fallbackHandler,
          config.chainId,
          SUPPORTED_VERSIONS,
        ),
    }
  })
}
