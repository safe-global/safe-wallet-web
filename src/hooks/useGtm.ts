import { useEffect } from 'react'
import { gtmClear, gtmInit, setChainId } from '@/services/analytics/gtm'
import { useAppSelector } from '@/store'
import { CookieType, selectCookies } from '@/store/cookiesSlice'
import useChainId from './useChainId'

const useGtm = () => {
  const chainId = useChainId()
  const cookies = useAppSelector(selectCookies)
  const isAnalyticsEnabled = cookies[CookieType.ANALYTICS]

  useEffect(() => {
    isAnalyticsEnabled ? gtmInit() : gtmClear()
  }, [isAnalyticsEnabled])

  useEffect(() => {
    setChainId(chainId)
  }, [chainId])
}

export default useGtm
