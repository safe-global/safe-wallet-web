import useAdjustUrl from '@/hooks/useAdjustUrl'
import { renderHook } from '@/tests/test-utils'

// mock window history replaceState
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    replaceState: jest.fn(),
  },
})

describe('useAdjustUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not rewrite the URL if there is no ?safe= in the query', () => {
    renderHook(() => useAdjustUrl(), {
      routerProps: {
        asPath: '/welcome',
      },
    })

    expect(history.replaceState).not.toHaveBeenCalled()
  })

  it('should replace %3A for the safe param but preserve other query params', () => {
    renderHook(() => useAdjustUrl(), {
      routerProps: {
        asPath: '/hello?safe=gor%3A0x0000000000000000000000000000000000000000&test=hello%3Aworld',
      },
    })

    expect(history.replaceState).toHaveBeenCalledWith(
      undefined,
      '',
      '/hello?safe=gor:0x0000000000000000000000000000000000000000&test=hello%3Aworld',
    )
  })
})
