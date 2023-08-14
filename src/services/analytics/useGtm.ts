/**
 * This hook is used to initialize GTM and for anonymized page view tracking.
 * It won't initialize GTM if a consent wasn't given for analytics cookies.
 * The hook needs to be called when the app starts.
 */
import { useEffect, useState } from 'react'
import { gtmInit, gtmTrackPageview, gtmSetChainId, gtmEnableCookies, gtmDisableCookies } from '@/services/analytics/gtm'
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
  const [, setPrevAnalytics] = useState(isAnalyticsEnabled)
  const router = useRouter()

  // Initialize GTM
  useEffect(() => {
    gtmInit()
  }, [])

  // Enable GA cookies if consent was given
  useEffect(() => {
    setPrevAnalytics((prev) => {
      if (isAnalyticsEnabled === prev) return prev

      if (isAnalyticsEnabled) {
        gtmEnableCookies()
      } else {
        gtmDisableCookies()
      }

      return isAnalyticsEnabled
    })
  }, [isAnalyticsEnabled])

  // Set the chain ID for GTM
  useEffect(() => {
    gtmSetChainId(chainId)
  }, [chainId])

  // Track page views – anononimized by default.
  // Sensitive info, like the safe address or tx id, is always in the query string, which we DO NOT track.
  useEffect(() => {
    // Don't track 404 because it's not a real page, it immediately does a client-side redirect
    if (router.pathname === AppRoutes['404']) return

    gtmTrackPageview(router.pathname)
  }, [router.pathname])

  // Track meta events on app load
  useMetaEvents()
}

export default useGtm
