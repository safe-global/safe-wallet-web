/// <reference lib="webworker" />

import { initializeApp } from 'firebase/app'
import { onBackgroundMessage } from 'firebase/messaging/sw'
import { getMessaging } from 'firebase/messaging/sw'

import { parseFirebaseNotification, shouldShowNotification } from '@/services/firebase'
import { FIREBASE_OPTIONS } from '@/config/constants'
import { trackEvent } from '@/services/analytics'
import { isWebhookEvent } from '@/services/firebase/webhooks'
import { PUSH_NOTIFICATION_EVENTS } from '@/services/analytics/events/push-notifications'

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: unknown }

// Satisfy Workbox
self.__WB_MANIFEST

const hasFirebaseOptions = Object.values(FIREBASE_OPTIONS).every(Boolean)

if (hasFirebaseOptions) {
  // Must be called before `onBackgroundMessage` as Firebase embeds a `notificationclick` listener
  self.addEventListener(
    'notificationclick',
    (event) => {
      event.notification.close()

      const link = event.notification.tag

      if (!link) {
        return
      }

      self.clients.openWindow(link)

      trackEvent(PUSH_NOTIFICATION_EVENTS.CLICK_NOTIFICATION)
    },
    false,
  )

  const app = initializeApp(FIREBASE_OPTIONS)

  const messaging = getMessaging(app)

  onBackgroundMessage(messaging, async (payload) => {
    const ICON_PATH = '/images/safe-logo-green.png'
    const DEFAULT_LINK = 'https://app.safe.global'

    const shouldShow = await shouldShowNotification(payload)

    if (!shouldShow) {
      return
    }

    const notification = await parseFirebaseNotification(payload)

    if (!notification) {
      return
    }

    self.registration.showNotification(notification.title, {
      icon: ICON_PATH,
      body: notification.body,
      image: notification.image,
      tag: notification.link ?? DEFAULT_LINK,
    })

    trackEvent({
      ...PUSH_NOTIFICATION_EVENTS.SHOW_NOTIFICATION,
      label: isWebhookEvent(payload.data) ? payload.data.type : 'CUSTOM',
    })
  })
}
