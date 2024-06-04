import { AppRoutes } from '@/config/routes'
import useChainId from '@/hooks/useChainId'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { SafeAppAccessPolicyTypes, SafeAppFeatures } from '@safe-global/safe-gateway-typescript-sdk'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import { NATIVE_SWAPS_APP_ID } from '@/features/swap/config/constants'

const SWAPS_APP_CARD_STORAGE_KEY = 'showSwapsAppCard'

export function useNativeSwapsAppCard() {
  const chainId = useChainId()
  let [isVisible = true, setIsVisible] = useLocalStorage<boolean>(SWAPS_APP_CARD_STORAGE_KEY)
  const isSwapFeatureEnabled = useHasFeature(FEATURES.NATIVE_SWAPS)

  if (isVisible && !isSwapFeatureEnabled) {
    isVisible = false
  }

  const swapsCard: SafeAppData = {
    id: NATIVE_SWAPS_APP_ID,
    url: AppRoutes.swap,
    name: 'Native swaps are here!',
    description: 'Experience seamless trading with better decoding and security in native swaps.',
    accessControl: { type: SafeAppAccessPolicyTypes.NoRestrictions },
    tags: ['DeFi', 'DEX'],
    features: [SafeAppFeatures.BATCHED_TRANSACTIONS],
    socialProfiles: [],
    developerWebsite: '',
    chainIds: [chainId],
    iconUrl: '/images/common/swap.svg',
  }

  return {
    swapsCardDetails: swapsCard,
    isVisible,
    setIsVisible,
  }
}
