import * as router from 'next/router'

import { renderHook, act } from '@/tests/test-utils'
import { useWalletConnectSearchParamUri } from '../useWalletConnectSearchParamUri'

describe('useWalletConnectSearchParamUri', () => {
  const mockRouter = {
    query: {},
    replace: jest.fn(),
  } as unknown as router.NextRouter

  beforeEach(() => {
    jest.spyOn(router, 'useRouter').mockReturnValue(mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return null when wc uri search param is not present', () => {
    const { result } = renderHook(() => useWalletConnectSearchParamUri())
    const [wcUri] = result.current

    expect(wcUri).toBeNull()
  })

  it('should return the wc uri search param value when present', () => {
    mockRouter.query = { wc: 'wc:123' }

    const { result } = renderHook(() => useWalletConnectSearchParamUri())
    const [wcUri] = result.current

    expect(wcUri).toBe('wc:123')
  })

  it('should update the wc uri search param value when setWcUri is called', () => {
    const { result } = renderHook(() => useWalletConnectSearchParamUri())
    const [wcUri, setWcUri] = result.current

    expect(wcUri).toBe('wc:123')

    act(() => {
      setWcUri('wc:456')
    })

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: mockRouter.pathname,
      query: { wc: 'wc:456' },
    })

    expect(wcUri).toBe('wc:456')
  })

  it('should remove the wc uri search param when setWcUri is called with null', () => {
    mockRouter.query = { wc: 'wc:123' }

    const { result } = renderHook(() => useWalletConnectSearchParamUri())
    const [wcUri, setWcUri] = result.current

    expect(wcUri).toBe('wc:123')

    act(() => {
      setWcUri(null)
    })

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: mockRouter.pathname,
      query: {},
    })

    expect(wcUri).toBeNull()
  })
})
