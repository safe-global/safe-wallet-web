import { _getSafesToRegister } from '.'
import type { AddedSafesState } from '@/store/addedSafesSlice'
import type { PushNotificationPreferences } from '@/services/push-notifications/preferences'

describe('PushNotificationsBanner', () => {
  describe('getSafesToRegister', () => {
    it('should return all added safes if no preferences exist', () => {
      const addedSafes = {
        '1': {
          '0x123': {},
          '0x456': {},
        },
        '4': {
          '0x789': {},
        },
      } as unknown as AddedSafesState
      const allPreferences = undefined

      const result = _getSafesToRegister(addedSafes, allPreferences)

      expect(result).toEqual({
        '1': ['0x123', '0x456'],
        '4': ['0x789'],
      })
    })

    it('should return only newly added safes if preferences exist', () => {
      const addedSafes = {
        '1': {
          '0x123': {},
          '0x456': {},
        },
        '4': {
          '0x789': {},
        },
      } as unknown as AddedSafesState
      const allPreferences = {
        '1:0x123': {
          safeAddress: '0x123',
          chainId: '1',
        },
        '4:0x789': {
          safeAddress: '0x789',
          chainId: '4',
        },
      } as unknown as PushNotificationPreferences

      const result = _getSafesToRegister(addedSafes, allPreferences)

      expect(result).toEqual({
        '1': ['0x456'],
      })
    })

    it('should return all added safes if no preferences match', () => {
      const addedSafes = {
        '1': {
          '0x123': {},
          '0x456': {},
        },
        '4': {
          '0x789': {},
        },
      } as unknown as AddedSafesState
      const allPreferences = {
        '1:0x111': {
          safeAddress: '0x111',
          chainId: '1',
        },
        '4:0x222': {
          safeAddress: '0x222',
          chainId: '4',
        },
      } as unknown as PushNotificationPreferences

      const result = _getSafesToRegister(addedSafes, allPreferences)

      expect(result).toEqual({
        '1': ['0x123', '0x456'],
        '4': ['0x789'],
      })
    })
  })
})
