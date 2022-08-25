import { AnalyticsEvent } from './types'
import { IS_PRODUCTION } from '@/config/constants'
import { gtmTrack } from './gtm'

export const trackEvent = (eventData: AnalyticsEvent) => {
  if (!IS_PRODUCTION) {
    console.info('[Analytics]', eventData)
    return
  }

  gtmTrack(eventData)
}

export * from './types'
export * from './events'
