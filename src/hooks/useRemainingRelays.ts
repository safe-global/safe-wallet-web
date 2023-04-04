import type { AsyncResult } from '@/hooks/useAsync'
import useAsync from '@/hooks/useAsync'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Errors, logError } from '@/services/exceptions'
import { FEATURES, hasFeature } from '@/utils/chains'
import { useCurrentChain } from '@/hooks/useChains'
import { getRemainingRelays } from '@/services/tx/sponsoredCall'

const fetchRemainingRelays = async (chainId: string, address: string): Promise<number> => {
  try {
    return await getRemainingRelays(chainId, address)
  } catch (error) {
    logError(Errors._630, (error as Error).message)
    return 0
  }
}

export const useRemainingRelaysBySafe = (): AsyncResult<number> => {
  const chain = useCurrentChain()
  const safeAddress = useSafeAddress()

  return useAsync<number>(() => {
    if (!safeAddress || !chain || !hasFeature(chain, FEATURES.RELAYING)) return

    return fetchRemainingRelays(chain.chainId, safeAddress)
  }, [chain, safeAddress])
}

const getMinimum = (result: number[]) => Math.min(...result)

export const useLeastRemainingRelays = (ownerAddresses: string[]): AsyncResult<number> => {
  const chain = useCurrentChain()

  return useAsync<number>(() => {
    if (!chain || !hasFeature(chain, FEATURES.RELAYING)) return

    return Promise.all(ownerAddresses.map((address) => fetchRemainingRelays(chain.chainId, address))).then(getMinimum)
  }, [chain, ownerAddresses])
}
