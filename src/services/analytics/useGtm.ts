/**
 * This hook is used to initialize GTM and for anonymized page view tracking.
 * It won't initialize GTM if a consent wasn't given for analytics cookies.
 * The hook needs to be called when the app starts.
 */
import { useEffect, useMemo } from 'react'
import { gtmClear, gtmInit, gtmTrackPageview, gtmSetChainId, gtmTrack } from '@/services/analytics/gtm'
import { useAppSelector } from '@/store'
import { CookieType, selectCookies } from '@/store/cookiesSlice'
import useChainId from '@/hooks/useChainId'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { OVERVIEW_EVENTS, TX_LIST_EVENTS } from './events'
import { selectTotalAdded } from '@/store/addedSafesSlice'
import useSafeAddress from '@/hooks/useSafeAddress'
import { selectQueuedTransactions } from '@/store/txQueueSlice'

// Track meta events on app load
const useMetaEvents = (isAnalyticsEnabled: boolean) => {
  // Track total added safes
  const totalAddedSafes = useAppSelector(selectTotalAdded)
  useEffect(() => {
    if (!isAnalyticsEnabled || totalAddedSafes === 0) return

    gtmTrack({
      ...OVERVIEW_EVENTS.TOTAL_ADDED_SAFES,
      label: totalAddedSafes.toString(),
    })
  }, [isAnalyticsEnabled, totalAddedSafes])

  // Track queue size
  const safeAddress = useSafeAddress()
  const queue = useAppSelector(selectQueuedTransactions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const safeQueue = useMemo(() => queue, [safeAddress, queue !== undefined])
  useEffect(() => {
    if (!isAnalyticsEnabled || !safeQueue) return

    gtmTrack({
      ...TX_LIST_EVENTS.QUEUED_TXS,
      label: safeQueue.length.toString(),
    })
  }, [isAnalyticsEnabled, safeQueue])
}

const useGtm = () => {
  const chainId = useChainId()
  const cookies = useAppSelector(selectCookies)
  const isAnalyticsEnabled = cookies[CookieType.ANALYTICS]
  const router = useRouter()

  // Initialize GTM, or clear it if analytics is disabled
  useEffect(() => {
    // router.pathname doesn't contain the safe address
    // so we can override the initial dataLayer
    isAnalyticsEnabled ? gtmInit(router.pathname) : gtmClear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnalyticsEnabled])

  // Set the chain ID for GTM
  useEffect(() => {
    gtmSetChainId(chainId)
  }, [chainId])

  // Track page views – anononimized by default.
  // Sensitive info, like the safe address or tx id, is always in the query string, which we DO NOT track.
  useEffect(() => {
    if (isAnalyticsEnabled && router.pathname !== AppRoutes['404']) {
      gtmTrackPageview(router.pathname)
    }
  }, [isAnalyticsEnabled, router.pathname])

  // Track meta events on app load
  useMetaEvents(isAnalyticsEnabled)
}

export default useGtm
