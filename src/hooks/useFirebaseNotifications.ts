import { useEffect } from 'react'

import { initializeFirebase } from '@/services/firebase/app'

export const useFirebaseNotifications = (): void => {
  // TODO: Can we remove this?
  // Register servicer worker
  useEffect(() => {
    // if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    //   return
    // }

    const app = initializeFirebase()

    // if (app) {
    //   window.workbox.register()
    // }
  }, [])
}
