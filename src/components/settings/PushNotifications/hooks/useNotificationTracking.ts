import { keys as keysFromIndexedDb, update as updateIndexedDb } from 'idb-keyval'
import { useEffect, useMemo } from 'react'

import {
  _DEFAULT_WEBHOOK_TRACKING,
  createNotificationTrackingIndexedDb,
  parseNotificationTrackingKey,
} from '@/services/firebase/tracking'
import { trackEvent } from '@/services/analytics'
import { PUSH_NOTIFICATION_EVENTS } from '@/services/analytics/events/push-notifications'
import type { NotificationTracking, NotificationTrackingKey } from '@/services/firebase/tracking'
import type { WebhookType } from '@/services/firebase/webhooks'

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

export const useNotificationTracking = (): void => {
  // idb-keyval stores
  const trackingStore = useMemo(() => {
    if (typeof indexedDB !== 'undefined') {
      return createNotificationTrackingIndexedDb()
    }
  }, [])

  useEffect(() => {
    if (!trackingStore) {
      return
    }

    // Get all tracked webhooks
    keysFromIndexedDb<NotificationTrackingKey>(trackingStore)
      .then(async (trackedWebhooks) => {
        // For each type, get the tracking data, track it and then clear the entry
        const trackingPromises = trackedWebhooks
          .map(async (trackedWebhook) => {
            const { chainId, type } = parseNotificationTrackingKey(trackedWebhook)

            return updateIndexedDb<NotificationTracking[NotificationTrackingKey]>(
              trackedWebhook,
              (tracking) => {
                if (tracking) {
                  trackNotificationEvents(chainId, type, tracking)
                }

                return _DEFAULT_WEBHOOK_TRACKING
              },
              trackingStore,
            ).catch(() => null)
          })
          .filter((promise): promise is Promise<void> => Boolean(promise))

        await Promise.all(trackingPromises)
      })
      .catch(() => null)
  }, [trackingStore])
}
