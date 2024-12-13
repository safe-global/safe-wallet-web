import { AppRoutes } from '@/config/routes'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import type { SafeItems } from './useAllSafes'

let isTracked = false

const useTrackSafesCount = (ownedSafes: SafeItems | undefined, watchlistSafes: SafeItems | undefined) => {
  const router = useRouter()
  const isLoginPage = router.pathname === AppRoutes.welcome.accounts

  useEffect(() => {
    if (watchlistSafes && ownedSafes && isLoginPage && !isTracked) {
      trackEvent({ ...OVERVIEW_EVENTS.TOTAL_SAFES_OWNED, label: ownedSafes.length })
      trackEvent({ ...OVERVIEW_EVENTS.TOTAL_SAFES_WATCHLIST, label: watchlistSafes.length })
      isTracked = true
    }
  }, [isLoginPage, ownedSafes, watchlistSafes])
}

export default useTrackSafesCount
