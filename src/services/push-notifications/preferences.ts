// Be careful what you import here as it will increase the service worker bundle size

import { createStore as createIndexedDb } from 'idb-keyval'

import type { WebhookType } from '@/service-workers/firebase-messaging/webhook-types'

export type PushNotificationPrefsKey = `${string}:${string}`

export type PushNotificationPreferences = {
  [safeKey: PushNotificationPrefsKey]: {
    chainId: string
    safeAddress: string
    preferences: { [key in WebhookType]: boolean }
  }
}

export const getPushNotificationPrefsKey = (chainId: string, safeAddress: string): PushNotificationPrefsKey => {
  return `${chainId}:${safeAddress}`
}

export const createPushNotificationUuidIndexedDb = () => {
  const DB_NAME = 'notifications-uuid-database'
  const STORE_NAME = 'notifications-uuid-store'

  return createIndexedDb(DB_NAME, STORE_NAME)
}

export const createPushNotificationPrefsIndexedDb = () => {
  const DB_NAME = 'notifications-preferences-database'
  const STORE_NAME = 'notifications-preferences-store'

  return createIndexedDb(DB_NAME, STORE_NAME)
}
