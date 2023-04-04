import { renderHook, waitFor } from '@/tests/test-utils'
import {
  useLeastRemainingRelays,
  useRemainingRelaysBySafe,
  SAFE_GELATO_RELAY_SERVICE_URL,
} from '@/hooks/useRemainingRelays'
import * as useSafeAddress from '@/hooks/useSafeAddress'
import * as useChains from '@/hooks/useChains'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { FEATURES } from '@/utils/chains'

const SAFE_ADDRESS = '0x0000000000000000000000000000000000000001'

describe('fetch remaining relays hooks', () => {
  beforeEach(() => {
    jest
      .spyOn(useChains, 'useCurrentChain')
      .mockReturnValue({ chainId: '5', features: FEATURES.RELAYING } as unknown as ChainInfo)
    jest.spyOn(useSafeAddress, 'default').mockReturnValue(SAFE_ADDRESS)
  })

  describe('useRemainingRelaysBySafe hook', () => {
    it('should not call fetch if empty safe address', () => {
      jest.spyOn(useSafeAddress, 'default').mockReturnValue('')

      global.fetch = jest.fn()
      const mockFetch = jest.spyOn(global, 'fetch')

      renderHook(() => useRemainingRelaysBySafe())
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should call fetch with the right path params', () => {
      global.fetch = jest.fn()
      const mockFetch = jest.spyOn(global, 'fetch')

      const url = `${SAFE_GELATO_RELAY_SERVICE_URL}/5/${SAFE_ADDRESS}`

      renderHook(() => useRemainingRelaysBySafe())
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(url)
    })

    it('should not do a network request if chain does not support relay', () => {
      jest.spyOn(useChains, 'useCurrentChain').mockReturnValue({ chainId: '5', features: [] } as unknown as ChainInfo)

      global.fetch = jest.fn()
      const mockFetch = jest.spyOn(global, 'fetch')

      renderHook(() => useRemainingRelaysBySafe())
      expect(mockFetch).toHaveBeenCalledTimes(0)
    })
  })

  describe('useLeastRemainingRelays hook', () => {
    const ownerAddresses = ['0x00', '0x01', '0x02']

    it('should return 0 if one of the owners has no remaining relays', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue({
          json: () => Promise.resolve({ remaining: 3 }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ remaining: 0 }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ remaining: 5 }),
        })

      const { result } = renderHook(() => useLeastRemainingRelays(ownerAddresses))

      await waitFor(async () => {
        expect(result.current[0]).toBe(0)
      })
    })

    it('should return the minimum number of relays amongst owners', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue({
          json: () => Promise.resolve({ remaining: 3 }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ remaining: 2 }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ remaining: 5 }),
        })

      const { result } = renderHook(() => useLeastRemainingRelays(ownerAddresses))

      await waitFor(async () => {
        expect(result.current[0]).toBe(2)
      })
    })

    it('should return 0 if there is an error fetching the remaining relays', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue({
          json: () => Promise.resolve({ remaining: 3 }),
        })
        .mockRejectedValueOnce({
          json: () => Promise.reject('Failed to fetch'),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ remaining: 2 }),
        })

      const { result } = renderHook(() => useLeastRemainingRelays(ownerAddresses))

      await waitFor(async () => {
        expect(result.current[0]).toBe(0)
      })
    })

    it('should not do a network request if chain does not support relay', () => {
      jest.spyOn(useChains, 'useCurrentChain').mockReturnValue({ chainId: '5', features: [] } as unknown as ChainInfo)
      global.fetch = jest
        .fn()
        .mockResolvedValue({
          json: () => Promise.resolve({ remaining: 3 }),
        })
        .mockRejectedValueOnce({
          json: () => Promise.reject('Failed to fetch'),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ remaining: 2 }),
        })
      const mockFetch = jest.spyOn(global, 'fetch')

      renderHook(() => useLeastRemainingRelays(ownerAddresses))
      expect(mockFetch).toHaveBeenCalledTimes(0)
    })
  })
})
