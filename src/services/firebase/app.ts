// Be careful what you import here as it will increase the service worker bundle size

import { initializeApp } from 'firebase/app'
import type { FirebaseApp, FirebaseOptions } from 'firebase/app'

export const FIREBASE_IS_PRODUCTION = !!process.env.NEXT_PUBLIC_IS_PRODUCTION

export const FIREBASE_VAPID_KEY = FIREBASE_IS_PRODUCTION
  ? process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY_PRODUCTION || ''
  : process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY_STAGING || ''

export const FIREBASE_OPTIONS: FirebaseOptions = JSON.parse(
  FIREBASE_IS_PRODUCTION
    ? process.env.NEXT_PUBLIC_FIREBASE_OPTIONS_PRODUCTION || ''
    : process.env.NEXT_PUBLIC_FIREBASE_OPTIONS_STAGING || '',
)

export const initializeFirebase = () => {
  const hasFirebaseOptions = Object.values(FIREBASE_OPTIONS).every(Boolean)

  if (!hasFirebaseOptions) {
    return
  }

  let app: FirebaseApp | undefined

  try {
    app = initializeApp(FIREBASE_OPTIONS)
  } catch (e) {
    console.error('[Firebase] Initialization failed', e)
  }

  return app
}
