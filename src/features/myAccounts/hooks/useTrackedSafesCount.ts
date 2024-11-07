import { AppRoutes } from '@/config/routes'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { type SafeItem } from './useAllSafes'
import { type MultiChainSafeItem } from './useAllSafesGrouped'
import { isMultiChainSafeItem } from '@/features/multichain/utils/utils'

let isOwnedSafesTracked = false
let isWatchlistTracked = false

const useTrackSafesCount = (
  ownedSafes: (MultiChainSafeItem | SafeItem)[] | undefined,
  watchlistSafes: (MultiChainSafeItem | SafeItem)[] | undefined,
  wallet: ConnectedWallet | null,
) => {
  const router = useRouter()
  const isLoginPage = router.pathname === AppRoutes.welcome.accounts

  // Reset tracking for new wallet
  useEffect(() => {
    isOwnedSafesTracked = false
  }, [wallet?.address])

  useEffect(() => {
    const totalSafesOwned = ownedSafes?.reduce(
      (prev, current) => prev + (isMultiChainSafeItem(current) ? current.safes.length : 1),
      0,
    )
    if (wallet && !isOwnedSafesTracked && ownedSafes && ownedSafes.length > 0 && isLoginPage) {
      trackEvent({ ...OVERVIEW_EVENTS.TOTAL_SAFES_OWNED, label: totalSafesOwned })
      isOwnedSafesTracked = true
    }
  }, [isLoginPage, ownedSafes, wallet])

  useEffect(() => {
    const totalSafesWatched = watchlistSafes?.reduce(
      (prev, current) => prev + (isMultiChainSafeItem(current) ? current.safes.length : 1),
      0,
    )
    if (watchlistSafes && isLoginPage && watchlistSafes.length > 0 && !isWatchlistTracked) {
      trackEvent({ ...OVERVIEW_EVENTS.TOTAL_SAFES_WATCHLIST, label: totalSafesWatched })
      isWatchlistTracked = true
    }
  }, [isLoginPage, watchlistSafes])
}

export default useTrackSafesCount
