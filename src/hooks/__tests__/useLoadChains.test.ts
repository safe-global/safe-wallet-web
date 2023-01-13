import { getChainsConfig } from '@safe-global/safe-gateway-typescript-sdk'
import useLoadChains from '@/hooks/loadables/useLoadChains'
import { act, renderHook } from '@/tests/test-utils'

// Mock getChainsConfig
jest.mock('@safe-global/safe-gateway-typescript-sdk', () => {
  return {
    getChainsConfig: jest.fn(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            results: [
              {
                chainId: '4',
              },
            ],
          })
        }, 100)
      })
    }),
  }
})

// Jest tests for the useLoadChains hook
describe('useLoadChains hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  it('should fetch the chains when the hook is called', async () => {
    // Render the hook and check that the loading state is true
    const { result } = renderHook(() => useLoadChains())

    await act(async () => {
      jest.advanceTimersByTime(10)
    })

    var [data, error, loading] = result.current

    // Check that the loading state is true
    expect(loading).toBe(true)
    expect(error).toBe(undefined)
    expect(data).toEqual(undefined)

    // Check that the loading state is false after the promise resolves
    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    var [data, error, loading] = result.current

    expect(loading).toBe(false)
    expect(error).toBe(undefined)
    expect(data).toEqual([
      {
        chainId: '4',
      },
    ])
  })

  it('should set the error state when the promise rejects', async () => {
    // Change the getChainsConfig mock to reject
    ;(getChainsConfig as jest.Mock).mockImplementation(() => Promise.reject(new Error('Something went wrong')))

    const { result } = renderHook(() => useLoadChains())

    await act(async () => Promise.resolve())

    const [data, error, loading] = result.current

    expect(loading).toBe(false)
    expect(error?.message).toBe('Something went wrong')
    expect(data).toEqual(undefined)
  })
})
