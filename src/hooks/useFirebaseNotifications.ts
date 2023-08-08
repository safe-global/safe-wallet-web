import { useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getMessaging, onMessage } from 'firebase/messaging'

import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
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

export const useFirebaseNotifications = (): null => {
  const dispatch = useAppDispatch()

  // Listen for messages
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // TODO: Should this be added to the privacy policy?
    const _app = initializeApp({
      apiKey: FIREBASE_API_KEY,
      authDomain: FIREBASE_AUTH_DOMAIN,
      databaseURL: FIREBASE_DATABASE_URL,
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET,
      messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
      appId: FIREBASE_APP_ID,
      measurementId: FIREBASE_MEASUREMENT_ID,
    })

    const messaging = getMessaging(_app)

    const unsubscribe = onMessage(messaging, (payload) => {
      dispatch(
        showNotification({
          message: payload.notification?.title || '',
          detailedMessage: payload.notification?.body,
          groupKey: payload.messageId,
          variant: 'info',
        }),
      )
    })

    return () => {
      unsubscribe()
    }
  }, [dispatch])

  return null
}
