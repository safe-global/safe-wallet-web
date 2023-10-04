import { _getSafesToRegister } from '.'
import type { AddedSafesOnChain } from '@/store/addedSafesSlice'
import type { PushNotificationPreferences } from '@/services/push-notifications/preferences'

describe('PushNotificationsBanner', () => {
  describe('getSafesToRegister', () => {
    it('should return all added safes if no preferences exist', () => {
      const addedSafesOnChain = {
        '0x123': {},
        '0x456': {},
      } as unknown as AddedSafesOnChain
      const allPreferences = undefined

      const result = _getSafesToRegister('1', addedSafesOnChain, allPreferences)

      expect(result).toEqual({
        '1': ['0x123', '0x456'],
      })
    })

    it('should return only newly added safes if preferences exist', () => {
      const addedSafesOnChain = {
        '0x123': {},
        '0x456': {},
      } as unknown as AddedSafesOnChain
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

      const result = _getSafesToRegister('1', addedSafesOnChain, allPreferences)

      expect(result).toEqual({
        '1': ['0x456'],
      })
    })

    it('should return all added safes if no preferences match', () => {
      const addedSafesOnChain = {
        '0x123': {},
        '0x456': {},
      } as unknown as AddedSafesOnChain
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

      const result = _getSafesToRegister('1', addedSafesOnChain, allPreferences)

      expect(result).toEqual({
        '1': ['0x123', '0x456'],
      })
    })
  })
})
