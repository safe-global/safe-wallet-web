import semverSatisfies from 'semver/functions/satisfies'

import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

export enum VERSION_FEATURES {
  SAFE_TX_GAS_OPTIONAL = 'SAFE_TX_GAS_OPTIONAL',
  SAFE_TX_GUARDS = 'SAFE_TX_GUARDS',
  SAFE_FALLBACK_HANDLER = 'SAFE_FALLBACK_HANDLER',
  ETH_SIGN = 'ETH_SIGN',
}

const FEATURES_BY_VERSION: Record<VERSION_FEATURES, string> = {
  [VERSION_FEATURES.ETH_SIGN]: '>=1.1.0',
  [VERSION_FEATURES.SAFE_FALLBACK_HANDLER]: '>=1.1.1',
  [VERSION_FEATURES.SAFE_TX_GAS_OPTIONAL]: '>=1.3.0',
  [VERSION_FEATURES.SAFE_TX_GUARDS]: '>=1.3.0',
}

// Note: backend returns `SafeInfo['version']` as `null` for unsupported contracts

const isEnabledByVersion = (feature: VERSION_FEATURES, version: SafeInfo['version']): boolean => {
  if (!version || !(feature in FEATURES_BY_VERSION)) {
    return false
  }
  return semverSatisfies(version, FEATURES_BY_VERSION[feature])
}

export const enabledFeatures = (version: SafeInfo['version']): VERSION_FEATURES[] => {
  if (!version) {
    return []
  }
  return Object.values(VERSION_FEATURES).filter((feature) => isEnabledByVersion(feature, version))
}

export const versionHasFeature = (name: VERSION_FEATURES, version: SafeInfo['version']): boolean => {
  if (!version) {
    return false
  }
  return enabledFeatures(version).includes(name)
}
