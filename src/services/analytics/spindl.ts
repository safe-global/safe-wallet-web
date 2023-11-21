import spindl from '@spindl-xyz/attribution-lite'
import { IS_PRODUCTION, SPINDL_SDK_KEY } from '@/config/constants'

const spindlInit = () => {
  spindl.configure({
    sdkKey: SPINDL_SDK_KEY,
    debugMode: !IS_PRODUCTION,
  })
}

export default spindlInit
