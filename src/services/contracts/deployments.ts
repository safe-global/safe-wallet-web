import semverSatisfies from 'semver/functions/satisfies'
import {
  getSafeSingletonDeployment,
  getSafeL2SingletonDeployment,
  getMultiSendCallOnlyDeployment,
  getFallbackHandlerDeployment,
  getProxyFactoryDeployment,
  getSignMessageLibDeployment,
  getCreateCallDeployment,
} from '@safe-global/safe-deployments'
import type { SingletonDeployment, DeploymentFilter } from '@safe-global/safe-deployments'
import type { ChainInfo, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { getLatestSafeVersion } from '@/utils/chains'

export const _tryDeploymentVersions = (
  getDeployment: (filter?: DeploymentFilter) => SingletonDeployment | undefined,
  network: ChainInfo,
  version: SafeInfo['version'],
): SingletonDeployment | undefined => {
  // Unsupported Safe version
  if (version === null) {
    // Assume latest version as fallback
    return getDeployment({
      version: getLatestSafeVersion(network),
      network: network.chainId,
    })
  }

  // Supported Safe version
  return getDeployment({
    version,
    network: network.chainId,
  })
}

export const _isLegacy = (safeVersion: SafeInfo['version']): boolean => {
  const LEGACY_VERSIONS = '<=1.0.0'
  return !!safeVersion && semverSatisfies(safeVersion, LEGACY_VERSIONS)
}

export const _isL2 = (chain: ChainInfo, safeVersion: SafeInfo['version']): boolean => {
  const L2_VERSIONS = '>=1.3.0'

  // Unsupported safe version
  if (safeVersion === null) {
    return chain.l2
  }

  // We had L1 contracts on xDai, EWC and Volta so we also need to check version is after 1.3.0
  return chain.l2 && semverSatisfies(safeVersion, L2_VERSIONS)
}

export const getSafeContractDeployment = (
  chain: ChainInfo,
  safeVersion: SafeInfo['version'],
): SingletonDeployment | undefined => {
  // Check if prior to 1.0.0 to keep minimum compatibility
  if (_isLegacy(safeVersion)) {
    return getSafeSingletonDeployment({ version: '1.0.0' })
  }

  const getDeployment = _isL2(chain, safeVersion) ? getSafeL2SingletonDeployment : getSafeSingletonDeployment

  return _tryDeploymentVersions(getDeployment, chain, safeVersion)
}

export const getMultiSendCallOnlyContractDeployment = (chain: ChainInfo, safeVersion: SafeInfo['version']) => {
  return _tryDeploymentVersions(getMultiSendCallOnlyDeployment, chain, safeVersion)
}

export const getFallbackHandlerContractDeployment = (chain: ChainInfo, safeVersion: SafeInfo['version']) => {
  return _tryDeploymentVersions(getFallbackHandlerDeployment, chain, safeVersion)
}

export const getProxyFactoryContractDeployment = (chain: ChainInfo, safeVersion: SafeInfo['version']) => {
  return _tryDeploymentVersions(getProxyFactoryDeployment, chain, safeVersion)
}

export const getSignMessageLibContractDeployment = (chain: ChainInfo, safeVersion: SafeInfo['version']) => {
  return _tryDeploymentVersions(getSignMessageLibDeployment, chain, safeVersion)
}

export const getCreateCallContractDeployment = (chain: ChainInfo, safeVersion: SafeInfo['version']) => {
  return _tryDeploymentVersions(getCreateCallDeployment, chain, safeVersion)
}
