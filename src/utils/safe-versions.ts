import semverSatisfies from 'semver/functions/satisfies'

import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

export enum VERSION_FEATURES {
  ETH_SIGN = 'ETH_SIGN',
  SAFE_FALLBACK_HANDLER = 'SAFE_FALLBACK_HANDLER',
  // If needed in the future:
  // SAFE_TX_GAS_OPTIONAL = 'SAFE_TX_GAS_OPTIONAL',
  SAFE_TX_GUARDS = 'SAFE_TX_GUARDS',
}

const FEATURES_BY_VERSION: Record<VERSION_FEATURES, string> = {
  [VERSION_FEATURES.ETH_SIGN]: '>=1.1.0',
  [VERSION_FEATURES.SAFE_FALLBACK_HANDLER]: '>=1.1.1',
  // [VERSION_FEATURES.SAFE_TX_GAS_OPTIONAL]: '>=1.3.0',
  [VERSION_FEATURES.SAFE_TX_GUARDS]: '>=1.3.0',
}

// TODO: import `hasFeature` from SDK once 1.0.0 bug is fixed

export const versionHasFeature = (feature: VERSION_FEATURES, version: SafeInfo['version']): boolean => {
  // Note: backend returns `SafeInfo['version']` as `null` for unsupported contracts
  if (!version || !(feature in FEATURES_BY_VERSION)) {
    return false
  }

  return semverSatisfies(version, FEATURES_BY_VERSION[feature])
}
