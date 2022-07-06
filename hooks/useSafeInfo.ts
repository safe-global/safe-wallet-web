import { POLLING_INTERVAL } from '@/config/constants'
import { gatewayApi } from '@/store/gatewayApi'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'

const useSafeInfo = () => {
  const chainId = useChainId()
  const address = useSafeAddress()

  return gatewayApi.useGetSafeInfoQuery(
    {
      chainId: chainId!, // Can assert because we otherwise `skip`
      address: address!, // Can assert because we otherwise `skip`
    },
    {
      skip: !chainId || !address,
      pollingInterval: POLLING_INTERVAL,
    },
  )
}

export default useSafeInfo
