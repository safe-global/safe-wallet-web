import 'fake-indexeddb/auto'
import { set, setMany } from 'idb-keyval'
import { renderHook, waitFor } from '@/tests/test-utils'
import { hexZeroPad } from 'ethers/lib/utils'

import { createUuidStore, createPreferencesStore } from '../notifications-idb'
import {
  useNotificationPreferences,
  _DEFAULT_NOTIFICATION_PREFERENCES,
  _setPreferences,
  _setUuid,
} from '../useNotificationPreferences'
import { WebhookType } from '@/services/firebase/webhooks'

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => Math.random().toString(),
  },
})

describe('useNotificationPreferences', () => {
  beforeEach(() => {
    // Reset indexedDB
    indexedDB = new IDBFactory()
  })

  describe('uuidStore', () => {
    beforeEach(() => {
      _setUuid(undefined)
    })

    it('should initialise uuid if it does not exist', async () => {
      const { result } = renderHook(() => useNotificationPreferences())

      await waitFor(() => {
        expect(result.current.uuid).toEqual(expect.any(String))
      })
    })

    it('return uuid if it exists', async () => {
      const uuid = 'test-uuid'

      await set('uuid', uuid, createUuidStore())

      const { result } = renderHook(() => useNotificationPreferences())

      await waitFor(() => {
        expect(result.current.uuid).toEqual(uuid)
      })
    })
  })

  describe('preferencesStore', () => {
    beforeEach(() => {
      _setPreferences(undefined)
    })

    it('should return all existing preferences', async () => {
      const chainId = '1'
      const safeAddress = hexZeroPad('0x1', 20)

      const preferences = {
        [`${chainId}:${safeAddress}`]: {
          chainId,
          safeAddress,
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        },
      }

      await setMany(Object.entries(preferences), createPreferencesStore())

      const { result } = renderHook(() => useNotificationPreferences())

      await waitFor(() => {
        expect(result.current.getAllPreferences()).toEqual(preferences)
      })
    })

    it('should return existing Safe preferences', async () => {
      const chainId = '1'
      const safeAddress = hexZeroPad('0x1', 20)

      const preferences = {
        [`${chainId}:${safeAddress}`]: {
          chainId,
          safeAddress,
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        },
      }

      await setMany(Object.entries(preferences), createPreferencesStore())

      const { result } = renderHook(() => useNotificationPreferences())

      await waitFor(() => {
        expect(result.current.getPreferences(chainId, safeAddress)).toEqual(
          preferences[`${chainId}:${safeAddress}`].preferences,
        )
      })
    })

    it('should create preferences, then hydrate the preferences state', async () => {
      const { result } = renderHook(() => useNotificationPreferences())

      const chainId1 = '1'
      const safeAddress1 = hexZeroPad('0x1', 20)
      const safeAddress2 = hexZeroPad('0x1', 20)

      const chainId2 = '2'

      result.current._createPreferences({
        [chainId1]: [safeAddress1, safeAddress2],
        [chainId2]: [safeAddress1],
      })

      await waitFor(() => {
        expect(result.current.getAllPreferences()).toEqual({
          [`${chainId1}:${safeAddress1}`]: {
            chainId: chainId1,
            safeAddress: safeAddress1,
            preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
          },
          [`${chainId1}:${safeAddress2}`]: {
            chainId: chainId1,
            safeAddress: safeAddress2,
            preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
          },
          [`${chainId2}:${safeAddress1}`]: {
            chainId: chainId2,
            safeAddress: safeAddress1,
            preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
          },
        })
      })
    })

    it('should update preferences, then hydrate the preferences state', async () => {
      const chainId = '1'
      const safeAddress = hexZeroPad('0x1', 20)

      const preferences = {
        [`${chainId}:${safeAddress}`]: {
          chainId: chainId,
          safeAddress: safeAddress,
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        },
      }

      await setMany(Object.entries(preferences), createPreferencesStore())

      const { result } = renderHook(() => useNotificationPreferences())

      result.current.updatePreferences(chainId, safeAddress, {
        ..._DEFAULT_NOTIFICATION_PREFERENCES,
        [WebhookType.NEW_CONFIRMATION]: false,
      })

      await waitFor(() => {
        expect(result.current.getAllPreferences()).toEqual({
          [`${chainId}:${safeAddress}`]: {
            chainId: chainId,
            safeAddress: safeAddress,
            preferences: {
              ..._DEFAULT_NOTIFICATION_PREFERENCES,
              [WebhookType.NEW_CONFIRMATION]: false,
            },
          },
        })
      })
    })

    it('should delete preferences, then hydrate the preferences state', async () => {
      const chainId1 = '1'
      const safeAddress1 = hexZeroPad('0x1', 20)
      const safeAddress2 = hexZeroPad('0x1', 20)

      const chainId2 = '2'

      const preferences = {
        [`${chainId1}:${safeAddress1}`]: {
          chainId: chainId1,
          safeAddress: safeAddress1,
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        },
        [`${chainId1}:${safeAddress2}`]: {
          chainId: chainId1,
          safeAddress: safeAddress2,
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        },
        [`${chainId2}:${safeAddress1}`]: {
          chainId: chainId2,
          safeAddress: safeAddress1,
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        },
      }

      await setMany(Object.entries(preferences), createPreferencesStore())

      const { result } = renderHook(() => useNotificationPreferences())

      result.current._deletePreferences({
        [chainId1]: [safeAddress1, safeAddress2],
      })

      await waitFor(() => {
        expect(result.current.getAllPreferences()).toEqual({
          [`${chainId2}:${safeAddress1}`]: {
            chainId: chainId2,
            safeAddress: safeAddress1,
            preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
          },
        })
      })
    })

    it('should clearPreferences preferences, then hydrate the preferences state', async () => {
      const chainId1 = '1'
      const safeAddress1 = hexZeroPad('0x1', 20)
      const safeAddress2 = hexZeroPad('0x1', 20)

      const chainId2 = '2'

      const preferences = {
        [`${chainId1}:${safeAddress1}`]: {
          chainId: chainId1,
          safeAddress: safeAddress1,
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        },
        [`${chainId1}:${safeAddress2}`]: {
          chainId: chainId1,
          safeAddress: safeAddress2,
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        },
        [`${chainId2}:${safeAddress1}`]: {
          chainId: chainId2,
          safeAddress: safeAddress1,
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        },
      }

      await setMany(Object.entries(preferences), createPreferencesStore())

      const { result } = renderHook(() => useNotificationPreferences())

      result.current._deletePreferences({
        [chainId1]: [safeAddress1, safeAddress2],
      })

      await waitFor(() => {
        expect(result.current.getAllPreferences()).toEqual(undefined)
      })
    })

    it('should hydrate accross instances', async () => {
      const chainId1 = '1'
      const safeAddress1 = hexZeroPad('0x1', 20)
      const safeAddress2 = hexZeroPad('0x1', 20)

      const chainId2 = '2'
      const { result: instance1 } = renderHook(() => useNotificationPreferences())
      const { result: instance2 } = renderHook(() => useNotificationPreferences())

      instance1.current._createPreferences({
        [chainId1]: [safeAddress1, safeAddress2],
        [chainId2]: [safeAddress1],
      })

      const expectedPreferences = {
        [`${chainId1}:${safeAddress1}`]: {
          chainId: chainId1,
          safeAddress: safeAddress1,
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        },
        [`${chainId1}:${safeAddress2}`]: {
          chainId: chainId1,
          safeAddress: safeAddress2,
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        },
        [`${chainId2}:${safeAddress1}`]: {
          chainId: chainId2,
          safeAddress: safeAddress1,
          preferences: _DEFAULT_NOTIFICATION_PREFERENCES,
        },
      }

      await waitFor(() => {
        expect(instance1.current.getAllPreferences()).toEqual(expectedPreferences)
        expect(instance2.current.getAllPreferences()).toEqual(expectedPreferences)
      })
    })
  })
})
