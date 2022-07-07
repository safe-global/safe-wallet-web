import { getTransactionQueue, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import useAsync from './useAsync'
import { selectTxQueue, selectQueuedTransactionsByNonce } from '@/store/txQueueSlice'
import useSafeInfo from './useSafeInfo'

const useTxQueue = (
  pageUrl?: string,
): {
  page?: TransactionListPage
  error?: string
  loading: boolean
} => {
  const { safe } = useSafeInfo()
  const [chainId, address] = [safe?.chainId, safe?.address.value]

  // If pageUrl is passed, load a new queue page from the API
  const [page, error, loading] = useAsync<TransactionListPage | undefined>(async () => {
    if (!pageUrl || !chainId || !address) return
    return getTransactionQueue(chainId, address, pageUrl)
  }, [chainId, address, pageUrl])

  // The latest page of the queue is always in the store
  const queueState = useAppSelector(selectTxQueue)

  // Return the new page or the stored page
  return pageUrl
    ? {
        page,
        error: error?.message,
        loading,
      }
    : {
        page: queueState.data,
        error: queueState.error,
        loading: queueState.loading,
      }
}

export const useQueuedTxByNonce = (nonce?: number) => {
  return useAppSelector((state) => selectQueuedTransactionsByNonce(state, nonce))
}

export default useTxQueue
