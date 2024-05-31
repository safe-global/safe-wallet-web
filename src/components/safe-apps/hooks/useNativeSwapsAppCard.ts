import { AppRoutes } from '@/config/routes'
import useChainId from '@/hooks/useChainId'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { SafeAppAccessPolicyTypes } from '@safe-global/safe-gateway-typescript-sdk'

const SWAPS_APP_CARD_STORAGE_KEY = 'showSwapsAppCard'

export function useNativeSwapsAppCard() {
  const chainId = useChainId()
  const [isVisible = true, setIsVisible] = useLocalStorage<boolean>(SWAPS_APP_CARD_STORAGE_KEY)

  const swapsCard: SafeAppData = {
    id: 100_000,
    url: AppRoutes.swap,
    name: 'Native swaps are here!',
    description: 'Experience seamless trading with better decoding and security in native swaps.',
    accessControl: { type: SafeAppAccessPolicyTypes.NoRestrictions },
    tags: ['DeFi'],
    features: [],
    socialProfiles: [],
    developerWebsite: '',
    chainIds: [chainId],
    iconUrl: '/images/common/swap.svg',
    isNativeFeature: true,
  }

  return {
    swapsCardDetails: swapsCard,
    isVisible,
    setIsVisible,
  }
}
