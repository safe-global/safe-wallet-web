import { createStore } from 'idb-keyval'

import type { WebhookType } from '@/services/firebase/webhooks'

export const createUuidStore = () => {
  const DB_NAME = 'notifications-uuid-database'
  const STORE_NAME = 'notifications-uuid-store'

  return createStore(DB_NAME, STORE_NAME)
}

export type SafeNotificationKey = `${string}:${string}`

export type NotificationPreferences = {
  [safeKey: SafeNotificationKey]: {
    chainId: string
    safeAddress: string
    preferences: { [key in WebhookType]: boolean }
  }
}

export const getSafeNotificationKey = (chainId: string, safeAddress: string): SafeNotificationKey => {
  return `${chainId}:${safeAddress}`
}

export const createPreferencesStore = () => {
  const DB_NAME = 'notifications-preferences-database'
  const STORE_NAME = 'notifications-preferences-store'

  return createStore(DB_NAME, STORE_NAME)
}
