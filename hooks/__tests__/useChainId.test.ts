import { renderHook } from '@testing-library/react'
import { useRouter } from 'next/router'
import TestProviderWrapper from '@/mocks/TestProviderWrapper'
import useChainId from '@/hooks/useChainId'
import { useAppDispatch } from '@/store'
import { setLastChainId } from '@/store/sessionSlice'

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
  })

  it('should return the default chainId if no query params', () => {
    const { result } = renderHook(() => useChainId(), { wrapper: TestProviderWrapper })
    expect(result.current).toBe('4')
  })

  it('should return the chainId based on the chain query', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {
        chain: 'gno',
      },
    }))

    const { result } = renderHook(() => useChainId(), { wrapper: TestProviderWrapper })
    expect(result.current).toBe('100')
  })

  it('should return the chainId from the safe address', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {
        safe: 'matic:0x0000000000000000000000000000000000000000',
      },
    }))

    const { result } = renderHook(() => useChainId(), { wrapper: TestProviderWrapper })
    expect(result.current).toBe('137')
  })

  it('should throw when the chain query is invalid', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {
        chain: 'invalid',
      },
    }))

    const { result } = renderHook(() => useChainId(), { wrapper: TestProviderWrapper })
    expect(result.current.error).toBeTruthy()
  })

  it('should return the last used chain id if no chain in the URL', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {},
    }))

    renderHook(() => useAppDispatch()(setLastChainId('100')), { wrapper: TestProviderWrapper })

    const { result } = renderHook(() => useChainId(), { wrapper: TestProviderWrapper })
    expect(result.current).toBe('100')
  })
})
