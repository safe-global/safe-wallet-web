// Refrain from importing outside of this folder to keep firebase-sw.js bundle small

import { initializeApp } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'

import { FIREBASE_OPTIONS } from './constants'

export const initializeFirebase = () => {
  const hasFirebaseOptions = Object.values(FIREBASE_OPTIONS).every(Boolean)

  if (!hasFirebaseOptions) {
    return
  }

  let app: FirebaseApp | null = null

  try {
    app = initializeApp(FIREBASE_OPTIONS)
  } catch (e) {
    console.error('[Firebase] Initialization failed', e)
  }

  return app
}
