/// <reference lib="webworker" />

import { initializeApp } from 'firebase/app'
import { onBackgroundMessage } from 'firebase/messaging/sw'
import { getMessaging } from 'firebase/messaging/sw'

import { parseFirebaseNotification } from '@/services/firebase'

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: unknown }

// Satisfy Workbox
self.__WB_MANIFEST

// Must be called before `onBackgroundMessage` as Firebase embeds a `notificationclick` listener
self.addEventListener(
  'notificationclick',
  (event) => {
    event.notification.close()

    const link = event.notification.tag

    if (link) {
      self.clients.openWindow(link)
    }
  },
  false,
)

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
})

const messaging = getMessaging(app)

onBackgroundMessage(messaging, async (payload) => {
  const { title, body, image, link } = await parseFirebaseNotification(payload)

  if (title) {
    self.registration.showNotification(title, {
      icon: '/images/safe-logo-green.png',
      body,
      image,
      tag: link,
    })
  }
})
