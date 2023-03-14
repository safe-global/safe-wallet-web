import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Errors, logError } from '@/services/exceptions'
import { SAFE_GELATO_RELAY_SERVICE_URL } from '@/config/constants'

const fetchRemainingRelays = async (chainId: string, safeAddress: string): Promise<number | undefined> => {
  const url = `${SAFE_GELATO_RELAY_SERVICE_URL}/${chainId}/${safeAddress}`

  try {
    const res = await fetch(url)
    const data = await res.json()
    return data.remaining
  } catch (error) {
    logError(Errors._630, (error as Error).message)
  }
}

const useRemainingRelays = () => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()

  return useAsync(() => fetchRemainingRelays(chainId, safeAddress), [chainId, safeAddress])
}

export default useRemainingRelays
