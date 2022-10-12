import semverSatisfies from 'semver/functions/satisfies'
import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'

const FEATURES_BY_VERSION: Record<string, string> = {
  [FEATURES.SAFE_TX_GAS_OPTIONAL]: '>=1.3.0',
}

export const isEnabledByVersion = (feature: FEATURES, version: string): boolean => {
  if (!(feature in FEATURES_BY_VERSION)) {
    return true
  }
  return semverSatisfies(version, FEATURES_BY_VERSION[feature])
}
