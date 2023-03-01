import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'

// TODO: replace once the relay-service is deployed
const RELAY_LIMIT_BASE_URL = 'http://localhost:3001/v1/relay'

const useRemainingRelays = () => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()

  const url = `${RELAY_LIMIT_BASE_URL}/${chainId}/${safeAddress}`

  const fetchRemainingRelays = async (): Promise<number | undefined> => {
    try {
      const res = await fetch(url)
      const data = await res.json()
      return data.remaining
    } catch (error) {
      console.error(error)
    }
  }

  return useAsync(fetchRemainingRelays, [chainId, safeAddress])
}

export default useRemainingRelays
