// getConfigs.test.ts

import { getConfigs } from '@/hooks/loadables/useLoadChains'

// Mock data for testing
const mockDataPage1 = {
  results: [
    { id: 1, name: 'Chain 1' },
    { id: 2, name: 'Chain 2' },
  ],
  next: 'https://safe-client.safe.global/v1/chains?cursor=limit%3D2%26offset%3D20',
}

const mockDataPage2 = {
  results: [
    { id: 3, name: 'Chain 3' },
    { id: 4, name: 'Chain 4' },
  ],
  next: null,
}

describe('getConfigs', () => {
  beforeEach(() => {
    // Clear all instances and calls to fetch
    jest.clearAllMocks()
  })

  it('should fetch data from the API and concatenate results', async () => {
    // Mock fetch responses for each call
    global.fetch = jest
      .fn()
      // First call returns mockDataPage1
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataPage1,
      })
      // Second call returns mockDataPage2
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataPage2,
      })

    const results = await getConfigs()

    expect(results).toEqual([
      { id: 1, name: 'Chain 1' },
      { id: 2, name: 'Chain 2' },
      { id: 3, name: 'Chain 3' },
      { id: 4, name: 'Chain 4' },
    ])

    // Ensure fetch was called twice
    expect(fetch).toHaveBeenCalledTimes(2)

    // Check that fetch was called with the correct URLs
    expect(fetch).toHaveBeenCalledWith('https://safe-client.staging.5afe.dev/v1/chains')
    expect(fetch).toHaveBeenCalledWith('https://safe-client.safe.global/v1/chains?cursor=limit%3D2%26offset%3D20')
  })

  it('should handle a single page of results', async () => {
    // Mock fetch response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ id: 1, name: 'Chain 1' }],
        next: null,
      }),
    })

    const results = await getConfigs()

    expect(results).toEqual([{ id: 1, name: 'Chain 1' }])

    // Ensure fetch was called once
    expect(fetch).toHaveBeenCalledTimes(1)

    // Check that fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith('https://safe-client.staging.5afe.dev/v1/chains')
  })

  it('should handle network errors gracefully', async () => {
    // Mock fetch to throw an error
    global.fetch = jest.fn().mockImplementation(() => {
      throw new Error('Network error')
    })

    // Spy on console.error to suppress error logs during test
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const results = await getConfigs()

    expect(results).toEqual([])

    // Ensure fetch was called once
    expect(fetch).toHaveBeenCalledTimes(1)

    // Restore console.error
    ;(console.error as jest.Mock).mockRestore()
  })

  it('should handle HTTP errors (non-200 responses)', async () => {
    // Mock fetch to return a non-OK response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    // Spy on console.error to suppress error logs during test
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const results = await getConfigs()

    expect(results).toEqual([])

    // Ensure fetch was called once
    expect(fetch).toHaveBeenCalledTimes(1)

    // Restore console.error
    ;(console.error as jest.Mock).mockRestore()
  })

  it('should handle empty results', async () => {
    // Mock fetch response with empty results
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [],
        next: null,
      }),
    })

    const results = await getConfigs()

    expect(results).toEqual([])

    // Ensure fetch was called once
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should handle missing next property', async () => {
    // Mock fetch response without next property
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ id: 1, name: 'Chain 1' }],
      }),
    })

    const results = await getConfigs()

    expect(results).toEqual([{ id: 1, name: 'Chain 1' }])

    // Ensure fetch was called once
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
