import { useEffect, useMemo, useState } from 'react'
import { del, delMany, entries, set, setMany } from 'idb-keyval'

import { WebhookType } from '@/services/firebase/webhooks'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getNotificationDbKey, createNotificationDbStore } from '@/services/firebase/notification-db'
import type { NotificationDbKey } from '@/services/firebase/notification-db'

const UUID_KEY = '__uuid'

const defaultNotificationPreferences = {
  [WebhookType.NEW_CONFIRMATION]: true,
  [WebhookType.EXECUTED_MULTISIG_TRANSACTION]: true,
  [WebhookType.PENDING_MULTISIG_TRANSACTION]: true,
  [WebhookType.INCOMING_ETHER]: true,
  [WebhookType.OUTGOING_ETHER]: true,
  [WebhookType.INCOMING_TOKEN]: true,
  [WebhookType.OUTGOING_TOKEN]: true,
  [WebhookType.MODULE_TRANSACTION]: true,
  [WebhookType.CONFIRMATION_REQUEST]: false, // Requires signature
}

export const useNotificationDb = () => {
  const { safe } = useSafeInfo()

  const SAFE_STORE_NAME =
    safe.chainId && safe.address.value ? getNotificationDbKey(safe.chainId, safe.address.value) : undefined

  const [notificationDb, setNotificationDb] = useState<
    Record<NotificationDbKey, typeof defaultNotificationPreferences> & { [UUID_KEY]: string }
  >({
    [UUID_KEY]: '',
  })

  const store = useMemo(() => {
    if (typeof window !== 'undefined') {
      return createNotificationDbStore()
    }
  }, [])

  // Load database
  useEffect(() => {
    if (!store) {
      return
    }

    entries(store)
      .then(async (entries) => {
        const db = Object.fromEntries(entries)

        // Set UUID if it does not exist
        if (!db[UUID_KEY]) {
          const uuid = self.crypto.randomUUID()
          db[UUID_KEY] = uuid

          set(UUID_KEY, uuid, store)
        }

        setNotificationDb((prev) => ({ ...prev, ...db }))
      })
      .catch(() => null)
  }, [store])

  const notificationPreferences = SAFE_STORE_NAME ? notificationDb[SAFE_STORE_NAME] : undefined

  const setNotificationPreferences = (preferences: typeof defaultNotificationPreferences) => {
    if (!SAFE_STORE_NAME) {
      return
    }

    const db = {
      ...notificationDb,
      [SAFE_STORE_NAME]: {
        ...notificationPreferences,
        preferences,
      },
    }

    setMany(Object.entries(db), store)
      .then(() => {
        setNotificationDb((prev) => ({ ...prev, [SAFE_STORE_NAME]: preferences }))
      })
      .catch(() => null)
  }

  const locallyRegisteredSafes = useMemo(() => {
    const safes: { [chainId: string]: Array<string> } = {}

    for (const key of Object.keys(notificationDb)) {
      if (key === UUID_KEY) {
        continue
      }

      const [chainId, address] = key.split(':')

      if (!safes[chainId]) {
        safes[chainId] = []
      }

      safes[chainId].push(address)
    }

    return safes
  }, [notificationDb])

  const registerSafeLocally = (chainId: string, safeAddress: string) => {
    const key = getNotificationDbKey(chainId, safeAddress)

    set(key, defaultNotificationPreferences, store)
      .then(() => {
        setNotificationDb((prev) => ({ ...prev, [key]: defaultNotificationPreferences }))
      })
      .catch(() => null)
  }

  const unregisterSafeLocally = (chainId: string, safeAddress: string) => {
    const key = getNotificationDbKey(chainId, safeAddress)

    del(key, store)
      .then(() => {
        setNotificationDb((prev) => {
          delete prev[key]

          return prev
        })
      })
      .catch(() => null)
  }

  const clearLocallyRegisteredSafes = () => {
    const keys = Object.keys(notificationDb).filter((key) => key !== UUID_KEY)

    delMany(keys, store)
      .then(() => {
        setNotificationDb(({ [UUID_KEY]: uuid }) => {
          return { [UUID_KEY]: uuid }
        })
      })
      .catch(() => null)
  }

  return {
    deviceUuid: notificationDb[UUID_KEY],
    notificationPreferences: notificationPreferences ?? defaultNotificationPreferences,
    setNotificationPreferences,
    isSafeRegistered: !!notificationPreferences,
    locallyRegisteredSafes,
    registerSafeLocally,
    unregisterSafeLocally,
    clearLocallyRegisteredSafes,
  }
}
