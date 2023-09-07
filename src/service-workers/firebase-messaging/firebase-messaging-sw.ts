// Be careful what you import here as it will increase the service worker bundle size

/// <reference lib="webworker" />

import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

import { initializeFirebaseApp } from '@/services/push-notifications/firebase'
import {
  shouldShowServiceWorkerPushNotification,
  parseServiceWorkerPushNotification,
} from '@/service-workers/firebase-messaging/notifications'

declare const self: ServiceWorkerGlobalScope

export function firebaseMessagingSw() {
  const ICON_PATH = '/images/safe-logo-green.png'

  const app = initializeFirebaseApp()

  if (!app) {
    return
  }

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
    },
    false,
  )

  const messaging = getMessaging(app)

  onBackgroundMessage(messaging, async (payload) => {
    const shouldShow = await shouldShowServiceWorkerPushNotification(payload)

    if (!shouldShow) {
      return
    }

    const notification = await parseServiceWorkerPushNotification(payload)

    if (!notification) {
      return
    }

    self.registration.showNotification(notification.title || '', {
      icon: ICON_PATH,
      body: notification.body,
      image: notification.image,
      tag: notification.link ?? self.location.origin,
    })
  })
}
