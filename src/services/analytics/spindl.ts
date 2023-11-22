import spindl from '@spindl-xyz/attribution-lite'
import { IS_PRODUCTION } from '@/config/constants'

export const spindlInit = () => {
  const SPINDL_SDK_KEY = process.env.NEXT_PUBLIC_SPINDL_SDK_KEY

  spindl.configure({
    sdkKey: SPINDL_SDK_KEY || '',
    debugMode: !IS_PRODUCTION,
  })

  spindl.enableAutoPageViews()
}

export default spindl
