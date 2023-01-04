import { type SafeBalanceResponse, TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import * as store from '@/store'
import { renderHook } from '@/tests/test-utils'
import { hexZeroPad } from 'ethers/lib/utils'
import { useVisibleBalances } from '../useVisibleBalances'

describe('useVisibleBalances', () => {
  const hiddenTokenAddress = hexZeroPad('0x2', 20)
  const visibleTokenAddress = hexZeroPad('0x3', 20)

  test('empty balance', () => {
    const balance: SafeBalanceResponse = {
      fiatTotal: '0',
      items: [],
    }
    jest.spyOn(store, 'useAppSelector').mockImplementation((selector) =>
      selector({
        balances: { data: balance, error: undefined, loading: false },
        settings: {
          currency: 'USD',
          shortName: {
            copy: true,
            qr: true,
            show: true,
          },
          theme: {
            darkMode: false,
          },
          hiddenTokens: { ['4']: [hiddenTokenAddress] },
        },
      } as unknown as store.RootState),
    )

    const { result } = renderHook(() => useVisibleBalances())

    expect(result.current.balances.fiatTotal).toEqual('0')
    expect(result.current.balances.items).toHaveLength(0)
  })

  test('return only visible balance', () => {
    const balance: SafeBalanceResponse = {
      fiatTotal: '100',
      items: [
        {
          balance: '40',
          fiatBalance: '40',
          fiatConversion: '1',
          tokenInfo: {
            address: hiddenTokenAddress,
            decimals: 18,
            logoUri: '',
            name: 'Hidden Token',
            symbol: 'HT',
            type: TokenType.ERC20,
          },
        },
        {
          balance: '60',
          fiatBalance: '60',
          fiatConversion: '1',
          tokenInfo: {
            address: visibleTokenAddress,
            decimals: 18,
            logoUri: '',
            name: 'Visible Token',
            symbol: 'VT',
            type: TokenType.ERC20,
          },
        },
      ],
    }

    jest.spyOn(store, 'useAppSelector').mockImplementation((selector) =>
      selector({
        balances: { data: balance, error: undefined, loading: false },
        settings: {
          currency: 'USD',
          shortName: {
            copy: true,
            qr: true,
            show: true,
          },
          theme: {
            darkMode: false,
          },
          hiddenTokens: { ['4']: [hiddenTokenAddress] },
        },
      } as unknown as store.RootState),
    )

    const { result } = renderHook(() => useVisibleBalances())

    expect(result.current.balances.fiatTotal).toEqual('100')
    expect(result.current.balances.items).toHaveLength(1)
  })
})
