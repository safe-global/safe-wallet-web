import { AppRoutes } from '@/config/routes'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import type { SafeItems } from './useAllSafes'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'

let isOwnedSafesTracked = false
let isWatchlistTracked = false

const useTrackSafesCount = (
  ownedSafes: SafeItems | undefined,
  watchlistSafes: SafeItems | undefined,
  wallet: ConnectedWallet | null,
) => {
  const router = useRouter()
  const isLoginPage = router.pathname === AppRoutes.welcome.accounts

  // Reset tracking for new wallet
  useEffect(() => {
    isOwnedSafesTracked = false
  }, [wallet?.address])

  useEffect(() => {
    if (wallet && !isOwnedSafesTracked && ownedSafes && ownedSafes.length > 0 && isLoginPage) {
      trackEvent({ ...OVERVIEW_EVENTS.TOTAL_SAFES_OWNED, label: ownedSafes.length })
      isOwnedSafesTracked = true
    }
  }, [isLoginPage, ownedSafes, wallet])

  useEffect(() => {
    if (watchlistSafes && isLoginPage && watchlistSafes.length > 0 && !isWatchlistTracked) {
      trackEvent({ ...OVERVIEW_EVENTS.TOTAL_SAFES_WATCHLIST, label: watchlistSafes.length })
      isWatchlistTracked = true
    }
  }, [isLoginPage, watchlistSafes])
}

export default useTrackSafesCount
