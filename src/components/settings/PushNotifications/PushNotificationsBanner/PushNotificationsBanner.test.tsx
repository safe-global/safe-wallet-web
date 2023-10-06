import 'fake-indexeddb/auto'
import { hexZeroPad } from 'ethers/lib/utils'
import * as tracking from '@/services/analytics'
import * as navigation from 'next/navigation'
import type { ChainInfo, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { PushNotificationsBanner, _getSafesToRegister } from '.'
import { render } from '@/tests/test-utils'
import type { AddedSafesOnChain } from '@/store/addedSafesSlice'
import type { PushNotificationPreferences } from '@/services/push-notifications/preferences'

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => Math.random().toString(),
  },
})

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

  describe('PushNotificationsBanner', () => {
    beforeEach(() => {
      // Reset indexedDB
      indexedDB = new IDBFactory()

      window.localStorage.clear()

      jest.spyOn(navigation, 'useParams').mockReturnValue({
        safe: `eth:${hexZeroPad('0x123', 20)}`,
      })
    })

    it('should only track display of the banner once', () => {
      jest.spyOn(tracking, 'trackEvent')

      const ui = (
        <PushNotificationsBanner>
          <></>
        </PushNotificationsBanner>
      )

      const result = render(ui, {
        routerProps: {
          query: {
            safe: `eth:${hexZeroPad('0x123', 20)}`,
          },
        },
        initialReduxState: {
          chains: {
            loading: false,
            error: undefined,
            data: [
              {
                chainId: '1',
                features: ['PUSH_NOTIFICATIONS'],
              } as unknown as ChainInfo,
            ],
          },
          addedSafes: {
            '1': {
              [hexZeroPad('0x123', 20)]: {},
            } as unknown as AddedSafesOnChain,
          },
          safeInfo: {
            loading: false,
            error: undefined,
            data: {
              chainId: '1',
              address: {
                value: hexZeroPad('0x123', 20),
              },
            } as unknown as SafeInfo,
          },
        },
      })

      expect(tracking.trackEvent).toHaveBeenCalledTimes(1)

      result.rerender(ui)

      expect(tracking.trackEvent).toHaveBeenCalledTimes(1)
    })
  })
})
