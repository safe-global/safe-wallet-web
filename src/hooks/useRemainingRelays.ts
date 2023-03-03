import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Errors, logError } from '@/services/exceptions'

// TODO: replace once the relay-service is deployed
const RELAY_LIMIT_BASE_URL = 'http://localhost:3001/v1/relay'

const fetchRemainingRelays = async (chainId: string, safeAddress: string): Promise<number | undefined> => {
  const url = `${RELAY_LIMIT_BASE_URL}/${chainId}/${safeAddress}`

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
