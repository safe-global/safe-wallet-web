/**
 * This hook is used to initialize GTM and for anonymized page view tracking.
 * It won't initialize GTM if a consent wasn't given for analytics cookies.
 * The hook needs to be called when the app starts.
 */
import { useEffect } from 'react'
import { gtmClear, gtmInit, gtmTrackPageview, gtmSetChainId } from '@/services/analytics/gtm'
import { useAppSelector } from '@/store'
import { CookieType, selectCookies } from '@/store/cookiesSlice'
import useChainId from '@/hooks/useChainId'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import useMetaEvents from './useMetaEvents'

const useGtm = () => {
  const chainId = useChainId()
  const cookies = useAppSelector(selectCookies)
  const isAnalyticsEnabled = cookies[CookieType.ANALYTICS] || false
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
