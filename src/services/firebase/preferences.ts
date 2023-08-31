// Refrain from importing outside of this folder to keep firebase-sw.js bundle small

import { createStore } from 'idb-keyval'

import type { WebhookType } from './webhooks'

export const createNotificationUuidIndexedDb = () => {
  const DB_NAME = 'notifications-uuid-database'
  const STORE_NAME = 'notifications-uuid-store'

  return createStore(DB_NAME, STORE_NAME)
}

export type SafeNotificationPrefsKey = `${string}:${string}`

export type NotificationPreferences = {
  [safeKey: SafeNotificationPrefsKey]: {
    chainId: string
    safeAddress: string
    preferences: { [key in WebhookType]: boolean }
  }
}

export const getSafeNotificationPrefsKey = (chainId: string, safeAddress: string): SafeNotificationPrefsKey => {
  return `${chainId}:${safeAddress}`
}

export const createNotificationPrefsIndexedDb = () => {
  const DB_NAME = 'notifications-preferences-database'
  const STORE_NAME = 'notifications-preferences-store'

  return createStore(DB_NAME, STORE_NAME)
}
