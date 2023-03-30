import useAsync from '@/hooks/useAsync'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Errors, logError } from '@/services/exceptions'
import { SAFE_GELATO_RELAY_SERVICE_URL } from '@/config/constants'
import { FEATURES, hasFeature } from '@/utils/chains'
import { useCurrentChain } from '@/hooks/useChains'

const fetchRemainingRelays = async (chainId: string, address: string) => {
  const url = `${SAFE_GELATO_RELAY_SERVICE_URL}/${chainId}/${address}`

  try {
    const res = await fetch(url)
    const data = await res.json()
    return data.remaining
  } catch (error) {
    logError(Errors._630, (error as Error).message)
    return 0
  }
}

export const useRemainingRelaysBySafe = () => {
  const chain = useCurrentChain()
  const safeAddress = useSafeAddress()

  return useAsync(() => {
    if (!safeAddress || !chain || !hasFeature(chain, FEATURES.RELAYING)) return

    return fetchRemainingRelays(chain.chainId, safeAddress)
  }, [chain, safeAddress])
}

const getMinimum = (result: number[]) => Math.min(...result)

export const useLeastRemainingRelays = (ownerAddresses: string[]) => {
  const chain = useCurrentChain()

  return useAsync(async () => {
    if (!chain || !hasFeature(chain, FEATURES.RELAYING)) return

    const result = await Promise.all(ownerAddresses.map((address) => fetchRemainingRelays(chain.chainId, address)))

    return getMinimum(result)
  }, [chain, ownerAddresses])
}
