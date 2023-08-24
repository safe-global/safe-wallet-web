import { set, entries, delMany, setMany, clear, update } from 'idb-keyval'
import { useCallback, useEffect, useMemo } from 'react'

import { WebhookType } from '@/services/firebase/webhooks'
import ExternalStore from '@/services/ExternalStore'
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

// ExternalStores are used to keep indexedDB state longer than the component lifecycle
const { useStore: useUuid, setStore: setUuid } = new ExternalStore<string>()
const { useStore: usePreferences, setStore: setPreferences } = new ExternalStore<NotificationPreferences>()

export const useNotificationPreferences = () => {
  // State
  const uuid = useUuid()
  const preferences = usePreferences()

  // Getters
  const getPreferences = (chainId: string, safeAddress: string) => {
    const key = getSafeNotificationKey(chainId, safeAddress)
    return preferences?.[key]?.preferences
  }

  const getAllPreferences = useCallback(() => {
    return preferences
  }, [preferences])

  // idb-keyval stores
  const uuidStore = useMemo(() => {
    if (typeof indexedDB !== 'undefined') {
      return createUuidStore()
    }
  }, [])

  const preferencesStore = useMemo(() => {
    if (typeof indexedDB !== 'undefined') {
      return createPreferencesStore()
    }
  }, [])

  // UUID state hydrator
  const hydrateUuidStore = useCallback(() => {
    if (!uuidStore) {
      return
    }

    const UUID_KEY = 'uuid'

    let _uuid: string

    update<string>(
      UUID_KEY,
      (storedUuid) => {
        // Initialise UUID if it doesn't exist
        _uuid = storedUuid || self.crypto.randomUUID()
        return _uuid
      },
      uuidStore,
    )
      .then(() => {
        setUuid(_uuid)
      })
      .catch(() => null)
  }, [uuidStore])

  // Hydrate UUID state
  useEffect(() => {
    hydrateUuidStore()
  }, [hydrateUuidStore, uuidStore])

  // Preferences state hydrator
  const hydratePreferences = useCallback(() => {
    if (!preferencesStore) {
      return
    }

    entries<SafeNotificationKey, NotificationPreferences[SafeNotificationKey]>(preferencesStore)
      .then((preferencesEntries) => {
        setPreferences(Object.fromEntries(preferencesEntries))
      })
      .catch(() => null)
  }, [preferencesStore])

  // Hydrate preferences state
  useEffect(() => {
    hydratePreferences()
  }, [hydratePreferences])

  // Add store entry with default preferences for specified Safe(s)
  const createPreferences = (safesToRegister: { [chain: string]: Array<string> }) => {
    if (!preferencesStore) {
      return
    }

    const defaultPreferencesEntries = Object.entries(safesToRegister).flatMap(([chainId, safeAddresses]) => {
      return safeAddresses.map((safeAddress): [SafeNotificationKey, NotificationPreferences[SafeNotificationKey]] => {
        const key = getSafeNotificationKey(chainId, safeAddress)

        const defaultPreferences: NotificationPreferences[SafeNotificationKey] = {
          chainId,
          safeAddress,
          preferences: DEFAULT_NOTIFICATION_PREFERENCES,
        }

        return [key, defaultPreferences]
      })
    })

    setMany(defaultPreferencesEntries, preferencesStore)
      .then(hydratePreferences)
      .catch(() => null)
  }

  // Update preferences for specified Safe
  const updatePreferences = (
    chainId: string,
    safeAddress: string,
    preferences: NotificationPreferences[SafeNotificationKey]['preferences'],
  ) => {
    if (!preferencesStore) {
      return
    }

    const key = getSafeNotificationKey(chainId, safeAddress)

    const newPreferences: NotificationPreferences[SafeNotificationKey] = {
      safeAddress,
      chainId,
      preferences,
    }

    set(key, newPreferences, preferencesStore)
      .then(hydratePreferences)
      .catch(() => null)
  }

  // Delete preferences store entry for specified Safe(s)
  const deletePreferences = (safesToUnregister: { [chain: string]: Array<string> }) => {
    if (!preferencesStore) {
      return
    }

    const keysToDelete = Object.entries(safesToUnregister).flatMap(([chainId, safeAddresses]) => {
      return safeAddresses.map((safeAddress) => getSafeNotificationKey(chainId, safeAddress))
    })

    delMany(keysToDelete, preferencesStore)
      .then(hydratePreferences)
      .catch(() => null)
  }

  // Delete all preferences store entries
  const clearPreferences = () => {
    if (!preferencesStore) {
      return
    }

    clear(preferencesStore)
      .then(hydratePreferences)
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
