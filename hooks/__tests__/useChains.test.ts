import { getChainsConfig } from '@gnosis.pm/safe-react-gateway-sdk'
import useChains, { useInitChains } from '@/hooks/useChains'
import { act, renderHook } from '@/tests/test-utils'

// Mock getChainsConfig
jest.mock('@gnosis.pm/safe-react-gateway-sdk', () => {
  return {
    getChainsConfig: jest.fn(() =>
      Promise.resolve({
        results: [
          {
            chainId: '4',
          },
        ],
      }),
    ),
  }
})

// Jest tests for the useInitChains hook
describe('useInitChains hook', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should fetch the chains when the hook is called', async () => {
    // Render the hook and check that the loading state is true
    renderHook(() => useInitChains())
    const { result } = renderHook(() => useChains())

    // Check that the loading state is true
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(undefined)
    expect(result.current.configs).toEqual([])

    // Check that the loading state is false after the promise resolves
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(undefined)

    // Check that the store contains the chains
    expect(result.current.configs).toEqual([
      {
        chainId: '4',
      },
    ])
  })

  it('should set the error state when the promise rejects', async () => {
    // Change the getChainsConfig mock to reject
    ;(getChainsConfig as jest.Mock).mockImplementation(() => Promise.reject(new Error('Something went wrong')))

    // Render the hook and check that the loading state is true
    renderHook(() => useInitChains())
    const { result } = renderHook(() => useChains())

    // Check that the loading state is true
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(undefined)

    // Check that the loading state is false after the promise resolves
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Something went wrong')

    // Check that the store does not contain the chains
    expect(result.current.configs).toEqual([])
  })
})
