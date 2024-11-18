import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import useIsStakingFeatureEnabled from './useIsSwapFeatureEnabled'

const useIsStakingBannerEnabled = () => {
  const isStakingFeatureEnabled = useIsStakingFeatureEnabled()
  return useHasFeature(FEATURES.STAKING_BANNER) && isStakingFeatureEnabled
}

export default useIsStakingBannerEnabled
