// Be careful what you import here as it will increase the service worker bundle size

/// <reference lib="webworker" />

import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import type { MessagePayload } from 'firebase/messaging/sw'

import { initializeFirebase } from '@/services/firebase/app'
import { shouldShowNotification, parseFirebaseNotification } from '@/services/firebase/notifications'
import { cacheNotificationTrackingProperty as cacheNotificationTracking } from '@/services/firebase/tracking'

declare const self: ServiceWorkerGlobalScope

export type NotificationData = MessagePayload['data'] & {
  link: string
}

export function firebaseMessagingSw() {
  const ICON_PATH = '/images/safe-logo-green.png'

  const app = initializeFirebase()

  if (!app) {
    return
  }

  // Must be called before `onBackgroundMessage` as Firebase embeds a `notificationclick` listener
  self.addEventListener(
    'notificationclick',
    (event) => {
      event.notification.close()

      const { link }: NotificationData = event.notification.data

      cacheNotificationTracking('opened', event.notification.data)

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

    const data: NotificationData = {
      ...payload.data,
      link: notification.link ?? self.location.origin,
    }

    cacheNotificationTracking('shown', data)

    self.registration.showNotification(notification.title, {
      icon: ICON_PATH,
      body: notification.body,
      image: notification.image,
      // Used as type is any
      data,
    })
  })
}
