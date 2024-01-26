import spindl from '@spindl-xyz/attribution-lite'
import { IS_PRODUCTION } from '@/config/constants'

export const spindlInit = () => {
  const SPINDL_SDK_KEY = process.env.NEXT_PUBLIC_SPINDL_SDK_KEY

  if (!IS_PRODUCTION || !SPINDL_SDK_KEY) return

  spindl.configure({
    sdkKey: SPINDL_SDK_KEY || '',
    debugMode: false,
  })

  spindl.enableAutoPageViews()
}

export const spindlAttribute = (address: string) => {
  if (!IS_PRODUCTION) return

  spindl.attribute(address)
}
