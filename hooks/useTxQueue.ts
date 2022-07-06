import { gatewayApi } from '@/store/gatewayApi'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import { isMultisigExecutionInfo, isTransaction } from '@/utils/transaction-guards'

const useTxQueue = ({ pageUrl }: { pageUrl?: string } = {}) => {
  const chainId = useChainId()
  const address = useSafeAddress()

  return gatewayApi.useGetTxQueueQuery(
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

export const useQueuedTxByNonce = (nonce?: number) => {
  const { data } = useTxQueue()

  return data?.results.filter(isTransaction).filter((item) => {
    return isMultisigExecutionInfo(item.transaction.executionInfo) && item.transaction.executionInfo.nonce === nonce
  })
}

export default useTxQueue
