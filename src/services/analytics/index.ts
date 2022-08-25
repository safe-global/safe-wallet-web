import { AnalyticsEvent } from './types'
import { IS_PRODUCTION } from '@/config/constants'
import { gtmTrack } from './gtm'

export const trackEvent = (eventData: AnalyticsEvent) => {
  console.info('[Analytics]', eventData)

  if (IS_PRODUCTION) {
    gtmTrack(eventData)
  }
}

export * from './types'
export * from './events'
