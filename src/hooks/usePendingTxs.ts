import { useMemo } from 'react'
import {
  type TransactionListPage,
  type TransactionSummary,
  type LabelValue,
  getTransactionQueue,
} from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import { selectPendingTxIdsBySafe } from '@/store/pendingTxsSlice'
import useAsync from './useAsync'
import { isLabelListItem, isTransactionListItem } from '@/utils/transaction-guards'
import useSafeInfo from './useSafeInfo'

const usePendingTxIds = (): Array<TransactionSummary['id']> => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  return useAppSelector((state) => selectPendingTxIdsBySafe(state, chainId, safeAddress))
}

export const useHasPendingTxs = (): boolean => {
  const pendingIds = usePendingTxIds()
  return pendingIds.length > 0
}

export const usePendingTxsQueue = (): {
  page?: TransactionListPage
  error?: string
  loading: boolean
} => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const pendingIds = usePendingTxIds()

  const [untrustedQueue, error, loading] = useAsync<TransactionListPage>(() => {
    if (!pendingIds.length) return
    return getTransactionQueue(chainId, safeAddress, undefined, false)
  }, [chainId, safeAddress, pendingIds])

  const pendingTxPage = useMemo(() => {
    if (!untrustedQueue || !pendingIds.length) return

    // Find the pending txs in the "untrusted" queue by id
    // Keep labels too
    const results = untrustedQueue.results.filter(
      (item) => !isTransactionListItem(item) || pendingIds.includes(item.transaction.id),
    )

    // Adjust the first label ("Next" -> "Pending")
    if (results[0] && isLabelListItem(results[0])) {
      results[0].label = 'Pending' as LabelValue
    }

    return results.length ? { results } : undefined
  }, [untrustedQueue, pendingIds])

  return useMemo(
    () => ({
      page: pendingTxPage,
      error: error?.message,
      loading,
    }),
    [pendingTxPage, error, loading],
  )
}
