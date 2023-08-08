import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from '@/config/constants'

// TODO: Add these and VAPID_KEY to README.md
export const FIREBASE_CONFIG = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_DATABASE_URL,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
}

export const FIREBASE_SW_PATH = '/firebase-messaging-sw.js'

export const getFirebaseSwRegistrationPath = (): string => {
  const config = new URLSearchParams(FIREBASE_CONFIG).toString()

  // Service workers don't conflict as they are registered with params
  return `${FIREBASE_SW_PATH}?${config}`
}
