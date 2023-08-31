import {
  set as setIndexedDb,
  entries as getEntriesFromIndexedDb,
  delMany as deleteManyFromIndexedDb,
  setMany as setManyIndexedDb,
  clear as clearIndexedDb,
  update as updateIndexedDb,
} from 'idb-keyval'
import { useCallback, useEffect, useMemo } from 'react'

import { WebhookType } from '@/services/firebase/webhooks'
import ExternalStore from '@/services/ExternalStore'
import { createPreferencesStore, createUuidStore, getSafeNotificationKey } from './notifications-idb'
import type { NotificationPreferences, SafeNotificationKey } from './notifications-idb'
import type { NotifiableSafes } from '../logic'

export const _DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences[SafeNotificationKey]['preferences'] = {
  [WebhookType.NEW_CONFIRMATION]: true,
  [WebhookType.EXECUTED_MULTISIG_TRANSACTION]: true,
  [WebhookType.PENDING_MULTISIG_TRANSACTION]: true,
  [WebhookType.INCOMING_ETHER]: true,
  [WebhookType.OUTGOING_ETHER]: true,
  [WebhookType.INCOMING_TOKEN]: true,
  [WebhookType.OUTGOING_TOKEN]: true,
  [WebhookType.MODULE_TRANSACTION]: true,
  [WebhookType.CONFIRMATION_REQUEST]: true, // Requires signature
  [WebhookType.SAFE_CREATED]: false, // We do not preemptively subscribe to Safes before they are created
}

// ExternalStores are used to keep indexedDB state synced across hook instances
const { useStore: useUuid, setStore: setUuid } = new ExternalStore<string>()
const { useStore: usePreferences, setStore: setPreferences } = new ExternalStore<NotificationPreferences>()

// Used for testing
export const _setUuid = setUuid
export const _setPreferences = setPreferences

export const useNotificationPreferences = (): {
  uuid: string | undefined
  getAllPreferences: () => NotificationPreferences | undefined
  getPreferences: (chainId: string, safeAddress: string) => typeof _DEFAULT_NOTIFICATION_PREFERENCES | undefined
  updatePreferences: (
    chainId: string,
    safeAddress: string,
    preferences: NotificationPreferences[SafeNotificationKey]['preferences'],
  ) => void
  _createPreferences: (safesToRegister: NotifiableSafes) => void
  _deletePreferences: (safesToUnregister: NotifiableSafes) => void
  _clearPreferences: () => void
} => {
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

    updateIndexedDb<string>(
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

    getEntriesFromIndexedDb<SafeNotificationKey, NotificationPreferences[SafeNotificationKey]>(preferencesStore)
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
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        }

        return [key, defaultPreferences]
      })
    })

    setManyIndexedDb(defaultPreferencesEntries, preferencesStore)
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

    setIndexedDb(key, newPreferences, preferencesStore)
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

    deleteManyFromIndexedDb(keysToDelete, preferencesStore)
      .then(hydratePreferences)
      .catch(() => null)
  }

  // Delete all preferences store entries
  const clearPreferences = () => {
    if (!preferencesStore) {
      return
    }

    clearIndexedDb(preferencesStore)
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
