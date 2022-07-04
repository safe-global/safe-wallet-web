import { useRouter } from 'next/router'
import useChainId from '@/hooks/useChainId'
import { useAppDispatch } from '@/store'
import { setLastChainId } from '@/store/sessionSlice'
import { renderHook } from '@/tests/test-utils'

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

    // Mock console error because the hook will throw and show a huge error message in test output
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
    try {
      renderHook(() => useChainId())
    } catch (error) {
      expect((error as Error).message).toBe('Invalid chain short name in the URL')
    }
    consoleErrorMock.mockRestore()
  })

  it('should return the last used chain id if no chain in the URL', () => {
    ;(useRouter as any).mockImplementation(() => ({
      query: {},
    }))

    renderHook(() => useAppDispatch()(setLastChainId('100')))

    const { result } = renderHook(() => useChainId())
    expect(result.current).toBe('100')
  })
})
