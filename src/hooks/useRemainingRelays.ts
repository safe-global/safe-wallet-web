import useAsync from '@/hooks/useAsync'
import useSafeInfo from './useSafeInfo'
import { FEATURES, hasFeature } from '@/utils/chains'
import { useCurrentChain } from '@/hooks/useChains'
import { getRelayCount } from '@safe-global/safe-gateway-typescript-sdk'

export const MAX_HOUR_RELAYS = 5

export const useRelaysBySafe = (txOrigin?: string) => {
  const chain = useCurrentChain()
  const { safe, safeAddress } = useSafeInfo()

  return useAsync(() => {
    if (!safeAddress || !chain) return
    if (
      hasFeature(chain, FEATURES.RELAYING) ||
      (hasFeature(chain, FEATURES.RELAY_NATIVE_SWAPS) && txOrigin && JSON.parse(txOrigin).name === 'Safe Swap')
    ) {
      return getRelayCount(chain.chainId, safeAddress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, safeAddress, safe.txHistoryTag])
}

export const useLeastRemainingRelays = (ownerAddresses: string[]) => {
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()

  return useAsync(() => {
    if (!chain || !hasFeature(chain, FEATURES.RELAYING)) return

    return Promise.all(ownerAddresses.map((address) => getRelayCount(chain.chainId, address)))
      .then((result) => {
        const min = Math.min(...result.map((r) => r.remaining))
        return result.find((r) => r.remaining === min)
      })
      .catch(() => {
        return { remaining: 0, limit: MAX_HOUR_RELAYS }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, ownerAddresses, safe.txHistoryTag])
}
