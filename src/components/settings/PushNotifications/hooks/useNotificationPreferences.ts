import {
  set as setIndexedDb,
  entries as getEntriesFromIndexedDb,
  delMany as deleteManyFromIndexedDb,
  setMany as setManyIndexedDb,
  clear as clearIndexedDb,
  update as updateIndexedDb,
} from 'idb-keyval'
import { useCallback, useEffect, useMemo } from 'react'

import { WebhookType } from '@/service-workers/firebase-messaging/webhook-types'
import ExternalStore from '@/services/ExternalStore'
import {
  createPushNotificationPrefsIndexedDb,
  createPushNotificationUuidIndexedDb,
  getPushNotificationPrefsKey,
} from '@/services/push-notifications/preferences'
import type { PushNotificationPreferences, PushNotificationPrefsKey } from '@/services/push-notifications/preferences'
import type { NotifiableSafes } from '../logic'

export const DEFAULT_NOTIFICATION_PREFERENCES: PushNotificationPreferences[PushNotificationPrefsKey]['preferences'] = {
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
const { useStore: usePreferences, setStore: setPreferences } = new ExternalStore<PushNotificationPreferences>()

// Used for testing
export const _setUuid = setUuid
export const _setPreferences = setPreferences

export const useNotificationPreferences = (): {
  uuid: string | undefined
  getAllPreferences: () => PushNotificationPreferences | undefined
  getPreferences: (chainId: string, safeAddress: string) => typeof DEFAULT_NOTIFICATION_PREFERENCES | undefined
  updatePreferences: (
    chainId: string,
    safeAddress: string,
    preferences: PushNotificationPreferences[PushNotificationPrefsKey]['preferences'],
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
    const key = getPushNotificationPrefsKey(chainId, safeAddress)
    return preferences?.[key]?.preferences
  }

  const getAllPreferences = useCallback(() => {
    return preferences
  }, [preferences])

  // idb-keyval stores
  const uuidStore = useMemo(() => {
    if (typeof indexedDB !== 'undefined') {
      return createPushNotificationUuidIndexedDb()
    }
  }, [])

  const preferencesStore = useMemo(() => {
    if (typeof indexedDB !== 'undefined') {
      return createPushNotificationPrefsIndexedDb()
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

    getEntriesFromIndexedDb<PushNotificationPrefsKey, PushNotificationPreferences[PushNotificationPrefsKey]>(
      preferencesStore,
    )
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
      return safeAddresses.map(
        (safeAddress): [PushNotificationPrefsKey, PushNotificationPreferences[PushNotificationPrefsKey]] => {
          const key = getPushNotificationPrefsKey(chainId, safeAddress)

          const defaultPreferences: PushNotificationPreferences[PushNotificationPrefsKey] = {
            chainId,
            safeAddress,
            preferences: DEFAULT_NOTIFICATION_PREFERENCES,
          }

          return [key, defaultPreferences]
        },
      )
    })

    setManyIndexedDb(defaultPreferencesEntries, preferencesStore)
      .then(hydratePreferences)
      .catch(() => null)
  }

  // Update preferences for specified Safe
  const updatePreferences = (
    chainId: string,
    safeAddress: string,
    preferences: PushNotificationPreferences[PushNotificationPrefsKey]['preferences'],
  ) => {
    if (!preferencesStore) {
      return
    }

    const key = getPushNotificationPrefsKey(chainId, safeAddress)

    const newPreferences: PushNotificationPreferences[PushNotificationPrefsKey] = {
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
      return safeAddresses.map((safeAddress) => getPushNotificationPrefsKey(chainId, safeAddress))
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
