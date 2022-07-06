import { gatewayApi } from '@/store/gatewayApi'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'

const useCollectibles = () => {
  const chainId = useChainId()
  const address = useSafeAddress()

  return gatewayApi.useGetCollectiblesQuery(
    {
      chainId: chainId!, // Can assert because we otherwise `skip`
      address: address!, // Can assert because we otherwise `skip`
    },
    {
      skip: !chainId || !address,
    },
  )
}

export default useCollectibles
