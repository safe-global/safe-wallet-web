import useSafeAddress from '@/hooks/useSafeAddress'
import { useRouter } from 'next/router'
import { renderHook } from '@testing-library/react'

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
  it('should return the safe address', () => {
    const { result } = renderHook(() => useSafeAddress())
    expect(result.current).toBe('0x0000000000000000000000000000000000000000')
  })

  it('should not return the safe address when it is not in the query', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {
        safe: undefined,
      },
    }))

    const { result } = renderHook(() => useSafeAddress())
    expect(result.current).toBe('')
  })
})
