import { useAppSelector } from '@/store'
import { selectCgw } from '@/store/settingsSlice'
import { useEffect } from 'react'
import { GATEWAY_URL_PRODUCTION, GATEWAY_URL_STAGING, IS_PRODUCTION } from '@/config/constants'
import { cgwDebugStorage } from '@/components/sidebar/DebugToggle'
import { setBaseUrl as setGatewayBaseUrl } from '@safe-global/safe-gateway-typescript-sdk'

export const GATEWAY_URL = IS_PRODUCTION || cgwDebugStorage.get() ? GATEWAY_URL_PRODUCTION : GATEWAY_URL_STAGING

const useClientGateway = () => {
  const customCgw = useAppSelector(selectCgw)

  useEffect(() => {
    const url = customCgw || GATEWAY_URL
    setGatewayBaseUrl(url)
  }, [customCgw])
}

export default useClientGateway
