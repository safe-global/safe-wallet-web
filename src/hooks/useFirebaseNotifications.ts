import { useEffect } from 'react'

import { FIREBASE_MESSAGING_SW_PATH, FIREBASE_OPTIONS } from '@/config/constants'
import { initializeApp } from 'firebase/app'

export const useFirebaseNotifications = (): void => {
  // Register servicer worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const hasFirebaseOptions = Object.values(FIREBASE_OPTIONS).every(Boolean)

    if (!hasFirebaseOptions) {
      return
    }

    initializeApp(FIREBASE_OPTIONS)

    const registerFirebaseSw = () => {
      navigator.serviceWorker.register(FIREBASE_MESSAGING_SW_PATH).catch(() => null)
    }

    window.addEventListener('load', registerFirebaseSw)

    return () => {
      window.removeEventListener('load', registerFirebaseSw)
    }
  }, [])
}
