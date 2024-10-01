import { renderHook, waitFor } from '@/tests/test-utils'
import { useGetMultipleSafeOverviewsQuery, useGetSafeOverviewQuery } from '../api/gateway'
import { faker } from '@faker-js/faker'
import { getSafeOverviews } from '@safe-global/safe-gateway-typescript-sdk'

jest.mock('@safe-global/safe-gateway-typescript-sdk')

describe('safeOverviews', () => {
  const mockedGetSafeOverviews = getSafeOverviews as jest.MockedFunction<typeof getSafeOverviews>

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('useGetSafeOverviewQuery', () => {
    it('should return null for empty safe Address', async () => {
      const request = { chainId: '1', safeAddress: '' }
      const { result } = renderHook(() => useGetSafeOverviewQuery(request))

      // Request should get queued and remain loading for the queue seconds
      expect(result.current.isLoading).toBeTruthy()

      await waitFor(() => {
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.error).toBeUndefined()
        expect(result.current.data).toBeNull()
      })

      expect(mockedGetSafeOverviews).not.toHaveBeenCalled()
    })

    it('should return an error if fetching fails', async () => {
      const request = { chainId: '1', safeAddress: faker.finance.ethereumAddress() }
      mockedGetSafeOverviews.mockRejectedValueOnce('Service unavailable')

      const { result } = renderHook(() => useGetSafeOverviewQuery(request))

      // Request should get queued and remain loading for the queue seconds
      expect(result.current.isLoading).toBeTruthy()

      await waitFor(() => {
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.error).toBeDefined()
        expect(result.current.data).toBeUndefined()
      })
    })

    it('should return null if safeOverview is not found for a given Safe', async () => {
      const request = { chainId: '1', safeAddress: faker.finance.ethereumAddress() }
      mockedGetSafeOverviews.mockResolvedValueOnce([])

      const { result } = renderHook(() => useGetSafeOverviewQuery(request))

      // Request should get queued and remain loading for the queue seconds
      expect(result.current.isLoading).toBeTruthy()

      await Promise.resolve()

      await waitFor(() => {
        expect(mockedGetSafeOverviews).toHaveBeenCalled()
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.error).toBeUndefined()
        expect(result.current.data).toEqual(null)
      })
    })

    it('should return the Safe overview if fetching is successful', async () => {
      const request = { chainId: '1', safeAddress: faker.finance.ethereumAddress() }

      const mockOverview = {
        address: { value: request.safeAddress },
        chainId: '1',
        awaitingConfirmation: null,
        fiatTotal: '100',
        owners: [{ value: faker.finance.ethereumAddress() }],
        threshold: 1,
        queued: 0,
      }
      mockedGetSafeOverviews.mockResolvedValueOnce([mockOverview])

      const { result } = renderHook(() => useGetSafeOverviewQuery(request))

      // Request should get queued and remain loading for the queue seconds
      expect(result.current.isLoading).toBeTruthy()

      await Promise.resolve()

      await waitFor(() => {
        expect(mockedGetSafeOverviews).toHaveBeenCalled()
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.error).toBeUndefined()
        expect(result.current.data).toEqual(mockOverview)
      })
    })

    it('should immediately process queue if BATCH SIZE elements are queued', async () => {
      const fakeSafeAddress = faker.finance.ethereumAddress()
      const requests = [
        { chainId: '1', safeAddress: fakeSafeAddress },
        { chainId: '2', safeAddress: fakeSafeAddress },
        { chainId: '3', safeAddress: fakeSafeAddress },
        { chainId: '4', safeAddress: fakeSafeAddress },
        { chainId: '5', safeAddress: fakeSafeAddress },
        { chainId: '6', safeAddress: fakeSafeAddress },
        { chainId: '7', safeAddress: fakeSafeAddress },
        { chainId: '8', safeAddress: fakeSafeAddress },
        { chainId: '9', safeAddress: fakeSafeAddress },
        { chainId: '10', safeAddress: fakeSafeAddress },
      ]

      const mockOverviews = requests.map((request, idx) => ({
        address: { value: request.safeAddress },
        chainId: (idx + 1).toString(),
        awaitingConfirmation: null,
        fiatTotal: '100',
        owners: [{ value: faker.finance.ethereumAddress() }],
        threshold: 1,
        queued: 0,
      }))

      mockedGetSafeOverviews.mockResolvedValueOnce(mockOverviews)

      const { result: result0 } = renderHook(() => useGetSafeOverviewQuery(requests[0]))
      const { result: result1 } = renderHook(() => useGetSafeOverviewQuery(requests[1]))
      const { result: result2 } = renderHook(() => useGetSafeOverviewQuery(requests[2]))
      const { result: result3 } = renderHook(() => useGetSafeOverviewQuery(requests[3]))
      const { result: result4 } = renderHook(() => useGetSafeOverviewQuery(requests[4]))
      const { result: result5 } = renderHook(() => useGetSafeOverviewQuery(requests[5]))
      const { result: result6 } = renderHook(() => useGetSafeOverviewQuery(requests[6]))
      const { result: result7 } = renderHook(() => useGetSafeOverviewQuery(requests[7]))
      const { result: result8 } = renderHook(() => useGetSafeOverviewQuery(requests[8]))

      // After 9 requests they should all be loading
      expect(result0.current.isLoading).toBeTruthy()
      expect(result1.current.isLoading).toBeTruthy()
      expect(result2.current.isLoading).toBeTruthy()
      expect(result3.current.isLoading).toBeTruthy()
      expect(result4.current.isLoading).toBeTruthy()
      expect(result5.current.isLoading).toBeTruthy()
      expect(result6.current.isLoading).toBeTruthy()
      expect(result7.current.isLoading).toBeTruthy()
      expect(result8.current.isLoading).toBeTruthy()

      expect(mockedGetSafeOverviews).not.toHaveBeenCalled()

      // Trigger the 10th hook - causing all values to load
      const { result: result9 } = renderHook(() => useGetSafeOverviewQuery(requests[9]))

      await waitFor(() => {
        // Wait until they all resolve
        expect(result0.current.isLoading).toBeFalsy()
        expect(result1.current.isLoading).toBeFalsy()
        expect(result2.current.isLoading).toBeFalsy()
        expect(result3.current.isLoading).toBeFalsy()
        expect(result4.current.isLoading).toBeFalsy()
        expect(result5.current.isLoading).toBeFalsy()
        expect(result6.current.isLoading).toBeFalsy()
        expect(result7.current.isLoading).toBeFalsy()
        expect(result8.current.isLoading).toBeFalsy()
        expect(result9.current.isLoading).toBeFalsy()

        // One request that batched all requests together should have happened
        expect(mockedGetSafeOverviews).toHaveBeenCalledWith(
          [
            `1:${fakeSafeAddress}`,
            `2:${fakeSafeAddress}`,
            `3:${fakeSafeAddress}`,
            `4:${fakeSafeAddress}`,
            `5:${fakeSafeAddress}`,
            `6:${fakeSafeAddress}`,
            `7:${fakeSafeAddress}`,
            `8:${fakeSafeAddress}`,
            `9:${fakeSafeAddress}`,
            `10:${fakeSafeAddress}`,
          ],
          {
            currency: 'usd',
            trusted: true,
            exclude_spam: true,
          },
        )

        expect(result0.current.data).toEqual(mockOverviews[0])
        expect(result1.current.data).toEqual(mockOverviews[1])
        expect(result2.current.data).toEqual(mockOverviews[2])
        expect(result3.current.data).toEqual(mockOverviews[3])
        expect(result4.current.data).toEqual(mockOverviews[4])
        expect(result5.current.data).toEqual(mockOverviews[5])
        expect(result6.current.data).toEqual(mockOverviews[6])
        expect(result7.current.data).toEqual(mockOverviews[7])
        expect(result8.current.data).toEqual(mockOverviews[8])
        expect(result9.current.data).toEqual(mockOverviews[9])
      })
    })
  })

  describe('useGetMultipleSafeOverviewsQuery', () => {
    it('Should return empty list for empty list of Safes', async () => {
      const request = { currency: 'usd', safes: [] }

      const { result } = renderHook(() => useGetMultipleSafeOverviewsQuery(request))

      // Request should get queued and remain loading for the queue seconds
      expect(result.current.isLoading).toBeTruthy()

      await Promise.resolve()
      await Promise.resolve()

      await Promise.resolve()
      await Promise.resolve()

      await waitFor(() => {
        expect(result.current.error).toBeUndefined()
        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toBeFalsy()
      })
    })

    it('Should return a response for non-empty list', async () => {
      const request = {
        currency: 'usd',
        safes: [
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '10', isWatchlist: false },
        ],
      }

      const mockOverview1 = {
        address: { value: request.safes[0].address },
        chainId: '1',
        awaitingConfirmation: null,
        fiatTotal: '100',
        owners: [{ value: faker.finance.ethereumAddress() }],
        threshold: 1,
        queued: 0,
      }

      const mockOverview2 = {
        address: { value: request.safes[1].address },
        chainId: '10',
        awaitingConfirmation: null,
        fiatTotal: '200',
        owners: [{ value: faker.finance.ethereumAddress() }],
        threshold: 1,
        queued: 4,
      }

      mockedGetSafeOverviews.mockResolvedValueOnce([mockOverview1, mockOverview2])

      const { result } = renderHook(() => useGetMultipleSafeOverviewsQuery(request))

      // Request should get queued and remain loading for the queue seconds
      expect(result.current.isLoading).toBeTruthy()

      await waitFor(() => {
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.error).toBeUndefined()
        expect(result.current.data).toEqual([mockOverview1, mockOverview2])
      })
    })

    it('Should return an error if fetching fails', async () => {
      const request = {
        currency: 'usd',
        safes: [
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '10', isWatchlist: false },
        ],
      }

      mockedGetSafeOverviews.mockRejectedValueOnce('Not available')

      const { result } = renderHook(() => useGetMultipleSafeOverviewsQuery(request))

      // Request should get queued and remain loading for the queue seconds
      expect(result.current.isLoading).toBeTruthy()

      await waitFor(async () => {
        await Promise.resolve()
        expect(result.current.error).toBeDefined()
        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBeFalsy()
      })
    })

    it('Should split big batches into multiple requests', async () => {
      // Requests overviews for 15 Safes at once
      const request = {
        currency: 'usd',
        safes: [
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
          { address: faker.finance.ethereumAddress(), chainId: '1', isWatchlist: false },
        ],
      }

      const firstBatchOverviews = request.safes.slice(0, 10).map((safe) => ({
        address: { value: safe.address },
        chainId: '1',
        awaitingConfirmation: null,
        fiatTotal: faker.string.numeric({ length: { min: 1, max: 6 } }),
        owners: [{ value: faker.finance.ethereumAddress() }],
        threshold: 1,
        queued: 0,
      }))

      const secondBatchOverviews = request.safes.slice(10).map((safe) => ({
        address: { value: safe.address },
        chainId: '1',
        awaitingConfirmation: null,
        fiatTotal: faker.string.numeric({ length: { min: 1, max: 6 } }),
        owners: [{ value: faker.finance.ethereumAddress() }],
        threshold: 1,
        queued: 0,
      }))

      // Mock two fetch requests for the 2 batches
      mockedGetSafeOverviews.mockResolvedValueOnce(firstBatchOverviews).mockResolvedValueOnce(secondBatchOverviews)

      const { result } = renderHook(() => useGetMultipleSafeOverviewsQuery(request))

      // Request should get queued and remain loading for the queue seconds
      expect(result.current.isLoading).toBeTruthy()

      await waitFor(() => {
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.error).toBeUndefined()
        expect(result.current.data).toEqual([...firstBatchOverviews, ...secondBatchOverviews])
      })

      // Expect that the correct requests were sent
      expect(mockedGetSafeOverviews).toHaveBeenCalledTimes(2)
      expect(mockedGetSafeOverviews).toHaveBeenCalledWith(
        request.safes.slice(0, 10).map((safe) => `1:${safe.address}`),
        { currency: 'usd', exclude_spam: true, trusted: true },
      )

      expect(mockedGetSafeOverviews).toHaveBeenCalledWith(
        request.safes.slice(10).map((safe) => `1:${safe.address}`),
        { currency: 'usd', exclude_spam: true, trusted: true },
      )
    })
  })
})
