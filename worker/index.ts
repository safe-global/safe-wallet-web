import { initializeApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging/sw'
import { onBackgroundMessage } from 'firebase/messaging/sw'

declare let self: ServiceWorkerGlobalScope

  // To disable all workbox logging during development, you can set self.__WB_DISABLE_DEV_LOGS to true
  // https://developers.google.com/web/tools/workbox/guides/configure-workbox#disable_logging
;(self as any).__WB_DISABLE_DEV_LOGS = true

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

onBackgroundMessage(messaging, (payload) => {
  self.registration.showNotification(payload.notification?.title || '', {
    body: payload.notification?.body,
    icon: payload.notification?.image,
  })
})
