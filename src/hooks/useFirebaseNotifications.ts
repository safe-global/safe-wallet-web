import { useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getMessaging, onMessage } from 'firebase/messaging'

import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_MESSAGING_SW_PATH,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
} from '@/config/constants'
import { parseFirebaseNotification } from '@/services/firebase'

export const useFirebaseNotifications = (): null => {
  const dispatch = useAppDispatch()

  // Register servicer worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const registerFirebaseSw = () => {
      navigator.serviceWorker.register(FIREBASE_MESSAGING_SW_PATH).catch(() => null)
    }

    window.addEventListener('load', registerFirebaseSw)

    return () => {
      window.removeEventListener('load', registerFirebaseSw)
    }
  }, [])

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

    const unsubscribe = onMessage(messaging, async (payload) => {
      const { title, body } = await parseFirebaseNotification(payload)

      if (!title) {
        return
      }

      dispatch(
        showNotification({
          message: title,
          detailedMessage: body,
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
