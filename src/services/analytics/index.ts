import { IS_PRODUCTION } from '@/config/constants'
import { AnalyticsEvent } from './types'
import { gtmTrack } from './gtm'

export const trackEvent = (eventData: AnalyticsEvent) => {
  if (IS_PRODUCTION) {
    gtmTrack(eventData)
  }
}

export * from './types'
export * from './events'
