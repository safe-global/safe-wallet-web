import { useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getMessaging, onMessage } from 'firebase/messaging'

import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { FIREBASE_CONFIG, getFirebaseSwRegistrationPath } from '@/services/firebase'

export const useFirebaseNotifications = (): null => {
  const dispatch = useAppDispatch()

  // Register servicer worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const registerFirebaseSw = () => {
      // Firebase normally registers a service worker when calling `getToken`
      // but we register it manually to pass custom config from the env
      const serviceWorkerPath = getFirebaseSwRegistrationPath()

      navigator.serviceWorker.register(serviceWorkerPath).catch(() => null)
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
    const _app = initializeApp(FIREBASE_CONFIG)
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
