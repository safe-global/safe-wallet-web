import { createStore } from 'idb-keyval'

export type NotificationDbKey = `${string}:${string}`

export const getNotificationDbKey = (chainId: string, safeAddress: string): NotificationDbKey => {
  return `${chainId}:${safeAddress}`
}

export const createNotificationDbStore = () => {
  const DB_NAME = 'notifications-database'
  const STORE_NAME = 'notifications-store'

  return createStore(DB_NAME, STORE_NAME)
}
