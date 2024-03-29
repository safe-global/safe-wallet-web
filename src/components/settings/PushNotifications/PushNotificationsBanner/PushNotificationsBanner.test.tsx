import 'fake-indexeddb/auto'
import { extendedSafeInfoBuilder } from '@/tests/builders/safe'
import { toBeHex } from 'ethers'
import * as tracking from '@/services/analytics'
import { set } from 'idb-keyval'
import * as navigation from 'next/navigation'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { PushNotificationsBanner, _getSafesToRegister } from '.'
import { createPushNotificationPrefsIndexedDb } from '@/services/push-notifications/preferences'
import { act, render } from '@/tests/test-utils'
import type { AddedSafesOnChain } from '@/store/addedSafesSlice'
import type { PushNotificationPreferences } from '@/services/push-notifications/preferences'
import * as useWallet from '@/hooks/wallets/useWallet'
import type { EIP1193Provider } from '@web3-onboard/core'

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => Math.random().toString(),
  },
})

jest.spyOn(useWallet, 'default').mockImplementation(() => ({
  ens: '',
  address: '0x1230000000000000000000000000000000000000',
  provider: jest.fn() as unknown as EIP1193Provider,
  label: 'Metamask',
  chainId: '4',
}))

describe('PushNotificationsBanner', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

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
    const extendedSafeInfo = {
      ...extendedSafeInfoBuilder().build(),
      chainId: '1',
      address: {
        value: toBeHex('0x123', 20),
      },
    }

    beforeEach(() => {
      // Reset indexedDB
      indexedDB = new IDBFactory()

      window.localStorage.clear()

      jest.spyOn(navigation, 'useParams').mockReturnValue({
        safe: `eth:${toBeHex('0x123', 20)}`,
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
            safe: `eth:${toBeHex('0x123', 20)}`,
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
              [toBeHex('0x123', 20)]: {},
            } as unknown as AddedSafesOnChain,
          },
          safeInfo: {
            loading: false,
            error: undefined,
            data: extendedSafeInfo,
          },
        },
      })

      expect(tracking.trackEvent).toHaveBeenCalledTimes(1)

      result.rerender(ui)

      expect(tracking.trackEvent).toHaveBeenCalledTimes(1)
    })

    it('should display the banner', () => {
      const result = render(
        <PushNotificationsBanner>
          <></>
        </PushNotificationsBanner>,
        {
          routerProps: {
            query: {
              safe: `eth:${toBeHex('0x123', 20)}`,
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
                [toBeHex('0x123', 20)]: {},
              } as unknown as AddedSafesOnChain,
            },
            safeInfo: {
              loading: false,
              error: undefined,
              data: extendedSafeInfo,
            },
          },
        },
      )

      jest.advanceTimersByTime(3000)

      expect(result.getByText('Get notified about pending signatures', { exact: false })).toBeInTheDocument()
    })

    it('should not show the banner if notifications are not enabled', () => {
      const result = render(
        <PushNotificationsBanner>
          <></>
        </PushNotificationsBanner>,
        {
          routerProps: {
            query: {
              safe: `eth:${toBeHex('0x123', 20)}`,
            },
          },
          initialReduxState: {
            chains: {
              loading: false,
              error: undefined,
              data: [
                {
                  chainId: '1',
                  features: [], // Not enabled
                } as unknown as ChainInfo,
              ],
            },
            addedSafes: {
              '1': {
                [toBeHex('0x123', 20)]: {},
              } as unknown as AddedSafesOnChain,
            },
            safeInfo: {
              loading: false,
              error: undefined,
              data: extendedSafeInfo,
            },
          },
        },
      )

      expect(result.queryByText('Get notified about pending signatures', { exact: false })).not.toBeInTheDocument()
    })

    it('should not show the banner if the user has dismissed it', async () => {
      window.localStorage.setItem(
        'SAFE_v2__dismissPushNotifications',
        JSON.stringify({ '1': { [toBeHex('0x123', 20)]: true } }),
      )

      const result = render(
        <PushNotificationsBanner>
          <></>
        </PushNotificationsBanner>,
        {
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
                [toBeHex('0x123', 20)]: {},
              } as unknown as AddedSafesOnChain,
            },
            safeInfo: {
              loading: false,
              error: undefined,
              data: extendedSafeInfo,
            },
          },
        },
      )

      await act(() => {
        jest.advanceTimersByTime(3000)
        return Promise.resolve()
      })

      expect(result.queryByText('Get notified about pending signatures', { exact: false })).not.toBeInTheDocument()
    })

    it('should not show the banner if the Safe is not added', () => {
      const result = render(
        <PushNotificationsBanner>
          <></>
        </PushNotificationsBanner>,
        {
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
            addedSafes: {}, // Not added
            safeInfo: {
              loading: false,
              error: undefined,
              data: extendedSafeInfo,
            },
          },
        },
      )

      expect(result.queryByText('Get notified about pending signatures', { exact: false })).not.toBeInTheDocument()
    })

    it('should not show the banner if the user has already registered for notifications', () => {
      set(
        `1:${toBeHex('0x123', 20)}`, // Registered
        {
          safeAddress: toBeHex('0x123', 20),
          chainId: '1',
          preferences: {},
        },
        createPushNotificationPrefsIndexedDb(),
      )

      const result = render(
        <PushNotificationsBanner>
          <></>
        </PushNotificationsBanner>,
        {
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
                [toBeHex('0x123', 20)]: {},
              } as unknown as AddedSafesOnChain,
            },
            safeInfo: {
              loading: false,
              error: undefined,
              data: extendedSafeInfo,
            },
          },
        },
      )

      expect(result.queryByText('Get notified about pending signatures', { exact: false })).not.toBeInTheDocument()
    })
  })
})
