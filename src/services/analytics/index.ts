/**
 * The analytics service.
 *
 * Exports `trackEvent` and event types.
 * `trackEvent` is supposed to be called by UI components.
 *
 * The event definitions are in the `events` folder.
 *
 * Usage example:
 *
 * `import { trackEvent, ADDRESS_BOOK_EVENTS } from '@/services/analytics'`
 * `trackEvent(ADDRESS_BOOK_EVENTS.EXPORT)`
 */
import { gtmInit, gtmTrack, gtmTrackSafeApp } from './gtm'
import spindlInit from './spindl'

export const trackEvent = gtmTrack
export const trackSafeAppEvent = gtmTrackSafeApp

export * from './types'
export * from './events'

// Initialize GTM and Spindl
if (typeof window !== 'undefined') {
  gtmInit()
  spindlInit()
}
