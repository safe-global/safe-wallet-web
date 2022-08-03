import { getCollectibles, type SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync from '@/hooks/useAsync'
import useSafeAddress from '@/hooks/useSafeAddress'
import useChainId from '@/hooks/useChainId'

const useAllCollectibles = (): [SafeCollectibleResponse[] | undefined, Error | undefined, boolean] => {
  const safeAddress = useSafeAddress()
  const chainId = useChainId()

  const [data, error, loading] = useAsync<SafeCollectibleResponse[]>(
    () => getCollectibles(chainId, safeAddress),
    [safeAddress, chainId],
  )

  return [data, error, loading]
}

export default useAllCollectibles
