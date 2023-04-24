import useAsync from '@/hooks/useAsync'
import useSafeInfo from './useSafeInfo'
import { FEATURES, hasFeature } from '@/utils/chains'
import { useCurrentChain } from '@/hooks/useChains'
import { useRelayingDebugger } from '@/hooks/useRelayingDebugger'
import { getRelays } from '@/services/tx/relaying'

export const MAX_HOUR_RELAYS = 5

export const useRelaysBySafe = () => {
  const chain = useCurrentChain()
  const { safe, safeAddress } = useSafeInfo()
  const [isRelayingEnabled] = useRelayingDebugger()

  return useAsync(() => {
    if (!safeAddress || !chain || !hasFeature(chain, FEATURES.RELAYING) || !isRelayingEnabled) return

    return getRelays(chain.chainId, safeAddress)
  }, [chain, safeAddress, safe.txHistoryTag])
}

export const useLeastRemainingRelays = (ownerAddresses: string[]) => {
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()
  const [isRelayingEnabled] = useRelayingDebugger()

  return useAsync(() => {
    if (!chain || !hasFeature(chain, FEATURES.RELAYING) || !isRelayingEnabled) return

    return Promise.all(ownerAddresses.map((address) => getRelays(chain.chainId, address)))
      .then((result) => {
        const min = Math.min(...result.map((r) => r.remaining))
        return result.find((r) => r.remaining === min)
      })
      .catch(() => {
        return { remaining: 0, limit: MAX_HOUR_RELAYS }
      })
  }, [chain, ownerAddresses, safe.txHistoryTag])
}
