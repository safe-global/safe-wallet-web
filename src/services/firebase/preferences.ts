// Be careful what you import here as it will increase the service worker bundle size

import { createStore as createIndexedDb } from 'idb-keyval'

import type { WebhookType } from './webhooks'

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

export const createNotificationUuidIndexedDb = () => {
  const DB_NAME = 'notifications-uuid-database'
  const STORE_NAME = 'notifications-uuid-store'

  return createIndexedDb(DB_NAME, STORE_NAME)
}

export const createNotificationPrefsIndexedDb = () => {
  const DB_NAME = 'notifications-preferences-database'
  const STORE_NAME = 'notifications-preferences-store'

  return createIndexedDb(DB_NAME, STORE_NAME)
}
