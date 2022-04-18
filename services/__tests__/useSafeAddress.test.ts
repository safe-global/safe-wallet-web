import useSafeAddress from '../useSafeAddress'
import { useRouter } from 'next/router'
import { renderHook } from '@testing-library/react-hooks'

// Mock useRouter
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: {
      safe: 'rin:0x0000000000000000000000000000000000000000',
    },
  })),
}))

// Tests for the useSafeAddress hook
describe('useSafeAddress hook', () => {
  it('should return the safe address and chainId', () => {
    const { result } = renderHook(() => useSafeAddress())
    expect(result.current.address).toBe('0x0000000000000000000000000000000000000000')
    expect(result.current.chainId).toBe('4')
  })

  it('should not return the safe address and chainId when the safe address is not in the query', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {
        safe: undefined,
      },
    }))

    const { result } = renderHook(() => useSafeAddress())
    expect(result.current.address).toBe(undefined)
    expect(result.current.chainId).toBe(undefined)
  })
})
