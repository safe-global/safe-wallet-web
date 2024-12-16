import type { FetchArgs, BaseQueryApi } from '@reduxjs/toolkit/query/react'

describe('dynamicBaseQuery', () => {
  const api: BaseQueryApi = {
    dispatch: jest.fn(),
    getState: jest.fn(),
    abort: jest.fn(),
    signal: new AbortController().signal,
    extra: {},
    endpoint: 'testEndpoint',
    type: 'query',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws an error if baseUrl is not set', async () => {
    jest.isolateModules(async () => {
      const { dynamicBaseQuery } = await import('./cgwClient')
      // Note: We do NOT set baseUrl here, so it remains null by default.
      await expect(dynamicBaseQuery('/test', api, {})).rejects.toThrow(
        'baseUrl not set. Call setBaseUrl before using the cgwClient',
      )
    })
  })

  it('calls rawBaseQuery with correct url when baseUrl is set and args is a string', async () => {
    jest.isolateModules(async () => {
      // Re-import a fresh instance of the module
      const { dynamicBaseQuery, setBaseUrl, rawBaseQuery } = await import('./cgwClient')
      // Mock rawBaseQuery
      const mockRawBaseQuery = jest.fn().mockResolvedValue({ data: 'stringResult' })
      Object.assign(rawBaseQuery, mockRawBaseQuery)

      // Set the baseUrl
      setBaseUrl('http://example.com')

      const result = await dynamicBaseQuery('/test', api, {})

      expect(mockRawBaseQuery).toHaveBeenCalledWith('http://example.com//test', api)
      expect(result).toEqual({ data: 'stringResult' })
    })
  })

  it('calls rawBaseQuery with correct url when baseUrl is set and args is FetchArgs', async () => {
    jest.isolateModules(async () => {
      const { dynamicBaseQuery, setBaseUrl, rawBaseQuery } = await import('./cgwClient')
      const mockRawBaseQuery = jest.fn().mockResolvedValue({ data: 'objectResult' })
      Object.assign(rawBaseQuery, mockRawBaseQuery)

      setBaseUrl('http://example.com')

      const args: FetchArgs = { url: 'endpoint', method: 'POST', body: { hello: 'world' } }
      const extraOptions = { credentials: 'include' }

      const result = await dynamicBaseQuery(args, api, extraOptions)

      expect(mockRawBaseQuery).toHaveBeenCalledWith(
        { url: 'http://example.com//endpoint', method: 'POST', body: { hello: 'world' } },
        api,
        extraOptions,
      )
      expect(result).toEqual({ data: 'objectResult' })
    })
  })
})
