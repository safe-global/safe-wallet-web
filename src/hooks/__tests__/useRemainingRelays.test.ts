import { renderHook, waitFor } from '@/tests/test-utils'
import { useLeastRemainingRelays, useRelaysBySafe } from '@/hooks/useRemainingRelays'
import * as useSafeInfo from '@/hooks/useSafeInfo'
import * as useChains from '@/hooks/useChains'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { FEATURES } from '@/utils/chains'
import { SAFE_RELAY_SERVICE_URL } from '@/services/tx/relaying'

const SAFE_ADDRESS = '0x0000000000000000000000000000000000000001'

describe('fetch remaining relays hooks', () => {
  beforeEach(() => {
    jest
      .spyOn(useChains, 'useCurrentChain')
      .mockReturnValue({ chainId: '5', features: FEATURES.RELAYING } as unknown as ChainInfo)
    jest.spyOn(useSafeInfo, 'default').mockReturnValue({
      safe: {
        txHistoryTag: '0',
      },
      safeAddress: SAFE_ADDRESS,
    } as ReturnType<typeof useSafeInfo.default>)
  })

  describe('useRelaysBySafe hook', () => {
    it('should not call fetch if empty safe address', () => {
      jest.spyOn(useSafeInfo, 'default').mockReturnValue({
        safe: {
          txHistoryTag: '0',
        },
        safeAddress: '',
      } as ReturnType<typeof useSafeInfo.default>)

      global.fetch = jest.fn()
      const mockFetch = jest.spyOn(global, 'fetch')

      renderHook(() => useRelaysBySafe())
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should call fetch with the right path params', () => {
      global.fetch = jest.fn()
      const mockFetch = jest.spyOn(global, 'fetch')

      const url = `${SAFE_RELAY_SERVICE_URL}/5/${SAFE_ADDRESS}`

      renderHook(() => useRelaysBySafe())
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(url)
    })

    it('should not do a network request if chain does not support relay', () => {
      jest.spyOn(useChains, 'useCurrentChain').mockReturnValue({ chainId: '5', features: [] } as unknown as ChainInfo)

      global.fetch = jest.fn()
      const mockFetch = jest.spyOn(global, 'fetch')

      renderHook(() => useRelaysBySafe())
      expect(mockFetch).toHaveBeenCalledTimes(0)
    })

    it('refetch if the txHistoryTag changes', () => {
      global.fetch = jest.fn()
      const mockFetch = jest.spyOn(global, 'fetch')

      const render = renderHook(() => useRelaysBySafe())
      expect(mockFetch).toHaveBeenCalledTimes(1)

      jest.spyOn(useSafeInfo, 'default').mockReturnValue({
        safe: {
          txHistoryTag: 'new',
        },
        safeAddress: SAFE_ADDRESS,
      } as ReturnType<typeof useSafeInfo.default>)

      render.rerender()

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('useLeastRemainingRelays hook', () => {
    const ownerAddresses = ['0x00', '0x01', '0x02']

    it('should return 0 if one of the owners has no remaining relays', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ remaining: 3 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ remaining: 0 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ remaining: 5 }),
        })

      const { result } = renderHook(() => useLeastRemainingRelays(ownerAddresses))

      await waitFor(async () => {
        expect(result.current[0]?.remaining).toBe(0)
      })
    })

    it('should return the minimum number of relays amongst owners', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ remaining: 3 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ remaining: 2 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ remaining: 5 }),
        })

      const { result } = renderHook(() => useLeastRemainingRelays(ownerAddresses))

      await waitFor(async () => {
        expect(result.current[0]?.remaining).toBe(2)
      })
    })

    it('should return 0 if there is an error fetching the remaining relays', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ remaining: 3 }),
        })
        .mockRejectedValueOnce({
          ok: false,
          json: () => Promise.reject('Failed to fetch'),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ remaining: 2 }),
        })

      const { result } = renderHook(() => useLeastRemainingRelays(ownerAddresses))

      await waitFor(async () => {
        expect(result.current[0]?.remaining).toBe(0)
      })
    })

    it('should not do a network request if chain does not support relay', () => {
      jest.spyOn(useChains, 'useCurrentChain').mockReturnValue({ chainId: '5', features: [] } as unknown as ChainInfo)
      global.fetch = jest
        .fn()
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ remaining: 3 }),
        })
        .mockRejectedValueOnce({
          ok: false,
          json: () => Promise.reject('Failed to fetch'),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ remaining: 2 }),
        })
      const mockFetch = jest.spyOn(global, 'fetch')

      renderHook(() => useLeastRemainingRelays(ownerAddresses))
      expect(mockFetch).toHaveBeenCalledTimes(0)
    })

    it('refetch if the txHistoryTag changes', () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ remaining: 3 }),
      })

      const mockFetch = jest.spyOn(global, 'fetch')

      const render = renderHook(() => useLeastRemainingRelays(ownerAddresses))
      expect(mockFetch).toHaveBeenCalledTimes(3)

      jest.spyOn(useSafeInfo, 'default').mockReturnValue({
        safe: {
          txHistoryTag: 'new',
        },
        safeAddress: SAFE_ADDRESS,
      } as ReturnType<typeof useSafeInfo.default>)

      render.rerender()

      expect(mockFetch).toHaveBeenCalledTimes(6)
    })
  })
})
