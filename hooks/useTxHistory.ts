import { gatewayApi } from '@/store/gatewayApi'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'

const useTxHistory = ({ pageUrl }: { pageUrl?: string } = {}) => {
  const chainId = useChainId()
  const address = useSafeAddress()

  return gatewayApi.useGetTxHistoryQuery(
    {
      chainId: chainId!, // Can assert because we otherwise `skip`
      address: address!, // Can assert because we otherwise `skip`
      pageUrl,
    },
    {
      skip: !chainId || !address,
    },
  )
}

export default useTxHistory
