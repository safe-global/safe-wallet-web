import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Errors, logError } from '@/services/exceptions'
import { SAFE_GELATO_RELAY_SERVICE_URL } from '@/config/constants'

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
  const chainId = useChainId()
  const safeAddress = useSafeAddress()

  return useAsync(() => {
    if (!safeAddress) return

    return fetchRemainingRelays(chainId, safeAddress)
  }, [chainId, safeAddress])
}

export const useLeastRemainingRelays = (ownerAddresses: string[]) => {
  const chainId = useChainId()

  const getMinimum = (result: number[]) => Math.min(...result)

  return useAsync(
    () =>
      Promise.all(ownerAddresses.map((address) => fetchRemainingRelays(chainId, address))).then((result) => {
        return getMinimum(result)
      }),
    [chainId, ownerAddresses],
  )
}
