import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'

export function useIsRecoverySupported(): boolean {
  return useHasFeature(FEATURES.RECOVERY) ?? false
}
