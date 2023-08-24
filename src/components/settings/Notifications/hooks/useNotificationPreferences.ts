import { get, set, entries, delMany, setMany, clear } from 'idb-keyval'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { WebhookType } from '@/services/firebase/webhooks'
import { createPreferencesStore, createUuidStore, getSafeNotificationKey } from './notifications-idb'
import type { NotificationPreferences, SafeNotificationKey } from './notifications-idb'

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences[SafeNotificationKey]['preferences'] = {
  [WebhookType.NEW_CONFIRMATION]: true,
  [WebhookType.EXECUTED_MULTISIG_TRANSACTION]: true,
  [WebhookType.PENDING_MULTISIG_TRANSACTION]: true,
  [WebhookType.INCOMING_ETHER]: true,
  [WebhookType.OUTGOING_ETHER]: true,
  [WebhookType.INCOMING_TOKEN]: true,
  [WebhookType.OUTGOING_TOKEN]: true,
  [WebhookType.MODULE_TRANSACTION]: true,
  [WebhookType.CONFIRMATION_REQUEST]: false, // Requires signature
  [WebhookType.SAFE_CREATED]: false, // Cannot be registered to predicted address
}

// TODO: mounted check in effects

export const useNotificationPreferences = () => {
  const [uuid, setUuid] = useState('')
  const [preferences, setPreferences] = useState<NotificationPreferences>()

  // UUID store
  const uuidStore = useMemo(() => {
    if (typeof window !== 'undefined') {
      return createUuidStore()
    }
  }, [])

  // Load/initialise UUID
  useEffect(() => {
    if (!uuidStore) {
      return
    }

    const UUID_KEY = 'uuid'

    get<string>(UUID_KEY, uuidStore)
      .then((uuid) => {
        if (!uuid) {
          uuid = self.crypto.randomUUID()
          set(UUID_KEY, uuid, uuidStore)
        }

        setUuid(uuid)
      })
      .catch(() => null)
  }, [uuidStore])

  // Preferences store
  const preferencesStore = useMemo(() => {
    if (typeof window !== 'undefined') {
      return createPreferencesStore()
    }
  }, [])

  // Load preferences
  useEffect(() => {
    if (!preferencesStore) {
      return
    }

    entries<SafeNotificationKey, NotificationPreferences[SafeNotificationKey]>(preferencesStore)
      .then((preferencesEntries) => {
        setPreferences(Object.fromEntries(preferencesEntries))
      })
      .catch(() => null)
  }, [preferencesStore])

  const getPreferences = (chainId: string, safeAddress: string) => {
    const key = getSafeNotificationKey(chainId, safeAddress)
    return preferences?.[key]?.preferences
  }

  const getAllPreferences = useCallback(() => {
    return preferences
  }, [preferences])

  const createPreferences = (safesToRegister: { [chain: string]: Array<string> }) => {
    if (!preferencesStore) {
      return
    }

    const defaultPreferencesEntries = Object.entries(safesToRegister).flatMap(([chainId, safeAddresses]) => {
      return safeAddresses.map((safeAddress): [SafeNotificationKey, NotificationPreferences[SafeNotificationKey]] => {
        const key = getSafeNotificationKey(chainId, safeAddress)

        return [
          key,
          {
            chainId,
            safeAddress,
            preferences: DEFAULT_NOTIFICATION_PREFERENCES,
          },
        ]
      })
    })

    setMany(defaultPreferencesEntries, preferencesStore)
      .then(() => {
        setPreferences(Object.fromEntries(defaultPreferencesEntries))
      })
      .catch(() => null)
  }

  const updatePreferences = (
    chainId: string,
    safeAddress: string,
    preferences: NotificationPreferences[SafeNotificationKey]['preferences'],
  ) => {
    if (!preferencesStore) {
      return
    }

    const key = getSafeNotificationKey(chainId, safeAddress)

    set(key, preferences, preferencesStore)
      .then(() => {
        setPreferences((prev) => ({
          ...prev,
          [key]: {
            ...prev?.[key],
            preferences,
          },
        }))
      })
      .catch(() => null)
  }

  const deletePreferences = (safesToUnregister: { [chain: string]: Array<string> }) => {
    if (!preferencesStore) {
      return
    }

    const keysToDelete = Object.entries(safesToUnregister).flatMap(([chainId, safeAddresses]) => {
      return safeAddresses.map((safeAddress) => getSafeNotificationKey(chainId, safeAddress))
    })

    delMany(keysToDelete, preferencesStore)
      .then(() => {
        setPreferences((prev) => {
          if (!prev) {
            return
          }

          const newEntries = Object.entries(prev).filter(([key]) => {
            return !keysToDelete.includes(key as SafeNotificationKey)
          })

          return Object.fromEntries(newEntries)
        })
      })
      .catch(() => null)
  }

  const clearPreferences = () => {
    if (!preferencesStore) {
      return
    }

    clear(preferencesStore)
      .then(() => {
        setPreferences({})
      })
      .catch(() => null)
  }

  return {
    uuid,
    getAllPreferences,
    getPreferences,
    updatePreferences,
    _createPreferences: createPreferences,
    _deletePreferences: deletePreferences,
    _clearPreferences: clearPreferences,
  }
}
