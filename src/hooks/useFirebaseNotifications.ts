import { useEffect } from 'react'

import { initializeFirebase } from '@/services/firebase/firebase'
import { FIREBASE_MESSAGING_SW_PATH } from '@/services/firebase/constants'

export const useFirebaseNotifications = (): void => {
  // Register servicer worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const app = initializeFirebase()

    if (!app) {
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
}
