import { useRouter } from 'next/router'
import useChainId from '@/hooks/useChainId'
import { useAppDispatch } from '@/store'
import { setLastChainId } from '@/store/sessionSlice'
import { renderHook } from '@/tests/test-utils'
import * as useWalletHook from '@/hooks/wallets/useWallet'
import * as useChains from '@/hooks/useChains'
import type { ConnectedWallet } from '@/services/onboard'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

// mock useRouter
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: {},
  })),
}))

describe('useChainId hook', () => {
  // Reset mocks before each test
  beforeEach(() => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {},
    }))

    Object.defineProperty(window, 'location', {
      writable: true,
      value: undefined,
    })
  })

  it('should read location.pathname if useRouter query.safe is empty', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {},
    }))

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        pathname: '/avax:0x0000000000000000000000000000000000000123/balances',
        search: '',
      },
    })

    const { result } = renderHook(() => useChainId())

    expect(result.current).toEqual('43114')
  })

  it('should read location.search if useRouter query.safe is empty', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {},
    }))

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        pathname: '/balances',
        search: '?safe=avax:0x0000000000000000000000000000000000000123&redirect=true',
      },
    })

    const { result } = renderHook(() => useChainId())

    expect(result.current).toEqual('43114')
  })

  it('should read location.search if useRouter query.chain is empty', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {},
    }))

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        pathname: '/welcome',
        search: '?chain=matic',
      },
    })

    const { result } = renderHook(() => useChainId())

    expect(result.current).toEqual('137')
  })

  it('should return the default chainId if no query params', () => {
    const { result } = renderHook(() => useChainId())
    expect(result.current).toBe('5')
  })

  it('should return the chainId based on the chain query', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {
        chain: 'gno',
      },
    }))

    const { result } = renderHook(() => useChainId())
    expect(result.current).toBe('100')
  })

  it('should return the chainId from the safe address', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {
        safe: 'matic:0x0000000000000000000000000000000000000000',
      },
    }))

    const { result } = renderHook(() => useChainId())
    expect(result.current).toBe('137')
  })

  it('should return the wallet chain id if no chain in the URL and it is present in the chain configs', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {},
    }))

    jest.spyOn(useWalletHook, 'default').mockImplementation(
      () =>
        ({
          chainId: '1337',
        } as ConnectedWallet),
    )

    jest.spyOn(useChains, 'default').mockImplementation(() => ({
      configs: [{ chainId: '1337' } as ChainInfo],
    }))

    const { result } = renderHook(() => useChainId())
    expect(result.current).toBe('1337')
  })

  it('should return the last used chain id if no chain in the URL and the connect wallet chain id is not present in the chain configs', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {},
    }))

    jest.spyOn(useWalletHook, 'default').mockImplementation(
      () =>
        ({
          chainId: '1337',
        } as ConnectedWallet),
    )

    jest.spyOn(useChains, 'default').mockImplementation(() => ({
      configs: [],
    }))

    const { result } = renderHook(() => useChainId())
    expect(result.current).toBe('5')
  })

  it('should return the last used chain id if no wallet is connected and there is no chain in the URL', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {},
    }))

    renderHook(() => useAppDispatch()(setLastChainId('100')))

    const { result } = renderHook(() => useChainId())
    expect(result.current).toBe('100')
  })
})
