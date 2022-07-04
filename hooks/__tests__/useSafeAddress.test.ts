import { useRouter } from 'next/router'
import { renderHook } from '@/tests/test-utils'
import useSafeAddress from '@/hooks/useSafeAddress'

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

  it('should cheksum the safe address', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {
        safe: 'eth:0x220866b1a2219f40e72f5c628b65d54268ca3a9d',
      },
    }))

    const { result } = renderHook(() => useSafeAddress())
    expect(result.current).toBe('0x220866B1A2219f40e72f5c628B65D54268cA3A9D')
  })
})
