import { renderHook } from '@testing-library/react-hooks'
import { useRouter } from 'next/router'
import useChainId from '../useChainId'

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
    const { result } = renderHook(() => useChainId())
    expect(result.current).toBe('4')
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

  it('should throw when the chain query is invalid', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {
        chain: 'invalid',
      },
    }))

    const { result } = renderHook(() => useChainId())
    expect(result.error).toBeTruthy()
  })
})
