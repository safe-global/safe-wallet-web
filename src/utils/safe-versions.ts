import {
  hasSafeFeature as sdkHasSafeFeature,
  type SAFE_FEATURES,
} from '@safe-global/protocol-kit/dist/src/utils/safeVersions'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

// Note: backend returns `SafeInfo['version']` as `null` for unsupported contracts
export const hasSafeFeature = (feature: SAFE_FEATURES, version: SafeInfo['version']): boolean => {
  if (!version) {
    return false
  }
  return sdkHasSafeFeature(feature, version)
}
