import { act, renderHook } from '@testing-library/react-hooks'
import { useRouter } from 'next/router'
import usePathRewrite, { useQueryRewrite } from '../usePathRewrite'

// Mock useRouter
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    pathname: '/safe/balances',
    query: {
      safe: 'rin:0x0000000000000000000000000000000000000000',
    },
    replace: jest.fn(),
  })),
}))

// mock window history replaceState
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    replaceState: jest.fn(),
  },
})

describe('usePathRewrite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should rewrite the path if there is /safe/ in path and ?safe= in the query', () => {
    renderHook(() => usePathRewrite())

    expect(history.replaceState).toHaveBeenCalledWith(
      undefined,
      '',
      '/rin:0x0000000000000000000000000000000000000000/balances',
    )
  })

  it('should not rewrite the path if there is no /safe/ in path or ?safe= in the query', () => {
    ;(useRouter as jest.Mock).mockImplementationOnce(() =>
      jest.fn(() => ({
        pathname: '/welcome',
        query: {},
        replace: jest.fn(),
      })),
    )

    renderHook(() => usePathRewrite())

    expect(history.replaceState).not.toHaveBeenCalled()
  })
})

describe('useQueryRewrite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not redirect if there is no Safe address in the path', async () => {
    const { result } = renderHook(() => useQueryRewrite())
    expect(result.current).toBe(false)
  })

  it('should redirect if there is a Safe address in the path', async () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        pathname: '/rin:0x0000000000000000000000000000000000000000/balances',
      },
    })

    const { result } = renderHook(() => useQueryRewrite())
    expect(result.current).toBe(true)
    await act(() => Promise.resolve())
    expect(result.current).toBe(true)
  })
})
