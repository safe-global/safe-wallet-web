// Be careful what you import here as it will increase the service worker bundle size

// TypeScript
/// <reference lib="webworker" />

import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

import { initializeFirebase } from '@/services/firebase/app'
import { shouldShowNotification, parseFirebaseNotification } from '@/services/firebase/notifications'

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
// TODO: Fix type
declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: unknown; __WB_DISABLE_DEV_LOGS: boolean }

// Satisfy workbox
self.__WB_MANIFEST

self.__WB_DISABLE_DEV_LOGS = true

const ICON_PATH = '/images/safe-logo-green.png'

const app = initializeFirebase()

if (app) {
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
      tag: notification.link ?? self.location.origin,
    })
  })
}
