import { useIsGeoblockedFeatureEnabled } from '@/hooks/useIsGeoblockedFeatureEnabled'
import { FEATURES } from '@/utils/chains'

export function useIsBridgeFeatureEnabled() {
  return useIsGeoblockedFeatureEnabled(FEATURES.BRIDGE)
}
