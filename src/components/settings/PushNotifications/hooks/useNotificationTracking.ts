import { keys as keysFromIndexedDb, update as updateIndexedDb } from 'idb-keyval'
import { useEffect, useMemo } from 'react'

import {
  _DEFAULT_WEBHOOK_TRACKING,
  createNotificationTrackingIndexedDb,
  parseNotificationTrackingKey,
} from '@/services/push-notifications/tracking'
import { trackEvent } from '@/services/analytics'
import { PUSH_NOTIFICATION_EVENTS } from '@/services/analytics/events/push-notifications'
import type { NotificationTracking, NotificationTrackingKey } from '@/services/push-notifications/tracking'
import type { WebhookType } from '@/service-workers/firebase-messaging/webhook-types'

const trackNotificationEvents = (
  chainId: string,
  type: WebhookType,
  tracking: NotificationTracking[NotificationTrackingKey],
) => {
  // Shown notifications
  Array.from({ length: tracking.shown }).forEach(() => {
    trackEvent({
      ...PUSH_NOTIFICATION_EVENTS.SHOW_NOTIFICATION,
      label: type,
      chainId,
    })
  })

  // Opened notifications
  Array.from({ length: tracking.opened }).forEach(() => {
    trackEvent({
      ...PUSH_NOTIFICATION_EVENTS.OPEN_NOTIFICATION,
      label: type,
      chainId,
    })
  })
}

const handleTrackCachedNotificationEvents = async (
  trackingStore: ReturnType<typeof createNotificationTrackingIndexedDb>,
) => {
  try {
    // Get all tracked webhook events by chainId, e.g. "1:NEW_CONFIRMATION"
    const trackedNotificationKeys = await keysFromIndexedDb<NotificationTrackingKey>(trackingStore)

    // Get the number of notifications shown/opened and track then clear the cache
    const promises = trackedNotificationKeys.map((key) => {
      return updateIndexedDb<NotificationTracking[NotificationTrackingKey]>(
        key,
        (tracking) => {
          if (tracking) {
            // If tracking occurred, track the events
            const { chainId, type } = parseNotificationTrackingKey(key)
            trackNotificationEvents(chainId, type, tracking)
          }

          // Return the default cache with 0 shown/opened events
          return _DEFAULT_WEBHOOK_TRACKING
        },
        trackingStore,
      )
    })

    await Promise.all(promises)
  } catch {
    // Swallow error
  }
}

export const useNotificationTracking = (): void => {
  // idb-keyval stores
  const trackingStore = useMemo(() => {
    if (typeof indexedDB !== 'undefined') {
      return createNotificationTrackingIndexedDb()
    }
  }, [])

  useEffect(() => {
    if (trackingStore) {
      handleTrackCachedNotificationEvents(trackingStore)
    }
  }, [trackingStore])
}
