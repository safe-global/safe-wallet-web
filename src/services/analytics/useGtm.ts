/**
 * This hook is used to initialize GTM and for anonymized page view tracking.
 * It won't initialize GTM if a consent wasn't given for analytics cookies.
 * The hook needs to be called when the app starts.
 */
import { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import {
  gtmInit,
  gtmTrackPageview,
  gtmSetChainId,
  gtmEnableCookies,
  gtmDisableCookies,
  gtmSetDeviceType,
  gtmSetSafeAddress,
} from '@/services/analytics/gtm'
import { useAppSelector } from '@/store'
import { CookieType, selectCookies } from '@/store/cookiesSlice'
import useChainId from '@/hooks/useChainId'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import useMetaEvents from './useMetaEvents'
import { useMediaQuery } from '@mui/material'
import { DeviceType } from './types'
import useSafeAddress from '@/hooks/useSafeAddress'

const useGtm = () => {
  const chainId = useChainId()
  const cookies = useAppSelector(selectCookies)
  const isAnalyticsEnabled = cookies[CookieType.ANALYTICS] || false
  const [, setPrevAnalytics] = useState(isAnalyticsEnabled)
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const deviceType = isMobile ? DeviceType.MOBILE : isTablet ? DeviceType.TABLET : DeviceType.DESKTOP
  const safeAddress = useSafeAddress()

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

  // Set the chain ID for all GTM events
  useEffect(() => {
    gtmSetChainId(chainId)
  }, [chainId])

  // Set device type for all GTM events
  useEffect(() => {
    gtmSetDeviceType(deviceType)
  }, [deviceType])

  // Set safe address for all GTM events
  useEffect(() => {
    gtmSetSafeAddress(safeAddress)
  }, [safeAddress])

  // Track page views – anonymized by default.
  useEffect(() => {
    // Don't track 404 because it's not a real page, it immediately does a client-side redirect
    if (router.pathname === AppRoutes['404']) return

    gtmTrackPageview(router.pathname)
  }, [router.pathname])

  // Track meta events on app load
  useMetaEvents()
}

export default useGtm
