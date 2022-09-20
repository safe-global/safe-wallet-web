import { useEffect, useState } from 'react'
import { getTransactionQueue, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import useAsync from './useAsync'
import { selectTxQueue, selectQueuedTransactionsByNonce } from '@/store/txQueueSlice'
import useSafeInfo from './useSafeInfo'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'

const useTxQueue = (
  pageUrl?: string,
): {
  page?: TransactionListPage
  error?: string
  loading: boolean
} => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId } = safe
  const [forceUpdateCount, setForceUpdateCount] = useState<number>(0)

  // If pageUrl is passed, load a new queue page from the API
  const [page, error, loading] = useAsync<TransactionListPage>(() => {
    if (!pageUrl || !safeLoaded) return
    return getTransactionQueue(chainId, safeAddress, pageUrl)
  }, [chainId, safeAddress, safeLoaded, pageUrl, forceUpdateCount])

  // Force an update when a tx has executed
  useEffect(() => {
    return txSubscribe(TxEvent.SUCCESS, () => {
      setForceUpdateCount((count: number) => count + 1)
    })
  }, [])

  // The latest page of the queue is always in the store
  const queueState = useAppSelector(selectTxQueue)

  // Return the new page or the stored page
  return pageUrl
    ? {
        page,
        error: error?.message,
        loading: loading,
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
