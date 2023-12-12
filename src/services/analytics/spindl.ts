import spindl from '@spindl-xyz/attribution-lite'
import { IS_PRODUCTION } from '@/config/constants'

export const spindlInit = () => {
  if (!IS_PRODUCTION) return

  const SPINDL_SDK_KEY = process.env.NEXT_PUBLIC_SPINDL_SDK_KEY

  spindl.configure({
    sdkKey: SPINDL_SDK_KEY || '',
    debugMode: false,
  })

  spindl.enableAutoPageViews()
}

export const spindlAttribute = (address: string) => {
  if (!IS_PRODUCTION) return

  void spindl.attribute(address)
}
