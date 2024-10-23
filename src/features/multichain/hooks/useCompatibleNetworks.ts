import { type ReplayedSafeProps } from '@/features/counterfactual/store/undeployedSafesSlice'
import useChains from '@/hooks/useChains'
import { hasCanonicalDeployment, hasMatchingDeployment } from '@/services/contracts/deployments'
import { type SafeVersion } from '@safe-global/safe-core-sdk-types'
import {
  getCompatibilityFallbackHandlerDeployments,
  getProxyFactoryDeployments,
  getSafeL2SingletonDeployments,
  getSafeSingletonDeployments,
  getSafeToL2SetupDeployments,
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
    const masterCopyExists =
      hasMatchingDeployment(getSafeSingletonDeployments, masterCopy, config.chainId, SUPPORTED_VERSIONS) ||
      hasMatchingDeployment(getSafeL2SingletonDeployments, masterCopy, config.chainId, SUPPORTED_VERSIONS)
    const proxyFactoryExists = hasMatchingDeployment(
      getProxyFactoryDeployments,
      factoryAddress,
      config.chainId,
      SUPPORTED_VERSIONS,
    )
    const fallbackHandlerExists = hasMatchingDeployment(
      getCompatibilityFallbackHandlerDeployments,
      fallbackHandler,
      config.chainId,
      SUPPORTED_VERSIONS,
    )

    const migrationContractExists = hasCanonicalDeployment(
      getSafeToL2SetupDeployments({ network: config.chainId, version: '1.4.1' }),
      config.chainId,
    )
    return {
      ...config,
      available: masterCopyExists && proxyFactoryExists && fallbackHandlerExists && migrationContractExists,
    }
  })
}
