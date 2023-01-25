import semverSatisfies from 'semver/functions/satisfies'

import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

export enum FEATURES {
  SAFE_TX_GAS_OPTIONAL = 'SAFE_TX_GAS_OPTIONAL',
  SAFE_TX_GUARDS = 'SAFE_TX_GUARDS',
  SAFE_FALLBACK_HANDLER = 'SAFE_FALLBACK_HANDLER',
  ETH_SIGN = 'ETH_SIGN',
}

const FEATURES_BY_VERSION: Record<FEATURES, string> = {
  [FEATURES.ETH_SIGN]: '>=1.1.0',
  [FEATURES.SAFE_FALLBACK_HANDLER]: '>=1.1.1',
  [FEATURES.SAFE_TX_GAS_OPTIONAL]: '>=1.3.0',
  [FEATURES.SAFE_TX_GUARDS]: '>=1.3.0',
}

// Note: backend returns `SafeInfo['version']` as `null` for unsupported contracts

const isEnabledByVersion = (feature: FEATURES, version: SafeInfo['version']): boolean => {
  if (!version || !(feature in FEATURES_BY_VERSION)) {
    return false
  }
  return semverSatisfies(version, FEATURES_BY_VERSION[feature])
}

export const enabledFeatures = (version: SafeInfo['version']): FEATURES[] => {
  if (!version) {
    return []
  }
  return Object.values(FEATURES).filter((feature) => isEnabledByVersion(feature, version))
}

export const hasFeature = (name: FEATURES, version: SafeInfo['version']): boolean => {
  if (!version) {
    return false
  }
  return enabledFeatures(version).includes(name)
}
