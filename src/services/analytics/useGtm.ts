import { useEffect } from 'react'
import { gtmClear, gtmInit, gtmTrackPageview, setChainId } from '@/services/analytics/gtm'
import { useAppSelector } from '@/store'
import { CookieType, selectCookies } from '@/store/cookiesSlice'
import useChainId from '@/hooks/useChainId'
import { useRouter } from 'next/router'

const useGtm = () => {
  const chainId = useChainId()
  const cookies = useAppSelector(selectCookies)
  const isAnalyticsEnabled = cookies[CookieType.ANALYTICS]
  const router = useRouter()

  // Initialize GTM, or clear it if analytics is disabled
  useEffect(() => {
    isAnalyticsEnabled ? gtmInit() : gtmClear()
  }, [isAnalyticsEnabled])

  // Set the chain ID for GTM
  useEffect(() => {
    setChainId(chainId)
  }, [chainId])

  // Track page views
  useEffect(() => {
    gtmTrackPageview(router.pathname)
  }, [router.pathname])
}

export default useGtm
