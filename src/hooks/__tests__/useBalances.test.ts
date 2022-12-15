import { type SafeBalanceResponse, TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import * as store from '@/store'
import * as hiddenAssets from '../useHiddenAssets'
import { renderHook } from '@/tests/test-utils'
import useBalances from '../useBalances'
import { hexZeroPad } from 'ethers/lib/utils'

describe('useBalances', () => {
  test('empty balance', () => {
    const balance: SafeBalanceResponse = {
      fiatTotal: '0',
      items: [],
    }
    jest.spyOn(store, 'useAppSelector').mockImplementation((selector) =>
      selector({
        balances: { data: balance, error: undefined, loading: false },
      } as store.RootState),
    )

    jest.spyOn(hiddenAssets, 'default').mockReturnValue({})

    const { result } = renderHook(() => useBalances(false))

    expect(result.current.balances.fiatTotal).toEqual('0')
    expect(result.current.balances.items).toHaveLength(0)
  })

  test('return all balances if includeHidden true', () => {
    const hiddenTokenAddress = hexZeroPad('0x2', 20)
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
            address: hiddenTokenAddress,
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
      } as store.RootState),
    )

    jest.spyOn(hiddenAssets, 'default').mockReturnValue({
      [hiddenTokenAddress]: hiddenTokenAddress,
    })

    const { result } = renderHook(() => useBalances(true))

    expect(result.current.balances.fiatTotal).toEqual('100')
    expect(result.current.balances.items).toHaveLength(2)
  })

  test('return only visible balances if includeHidden false', () => {
    const hiddenTokenAddress = hexZeroPad('0x2', 20)
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
            address: hexZeroPad('0x3', 20),
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
      } as store.RootState),
    )
    jest.spyOn(hiddenAssets, 'default').mockReturnValue({
      [hiddenTokenAddress]: hiddenTokenAddress,
    })

    const { result } = renderHook(() => useBalances(false))

    expect(result.current.balances.fiatTotal).toEqual('60')
    expect(result.current.balances.items).toHaveLength(1)
  })
})
