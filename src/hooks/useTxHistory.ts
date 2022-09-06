import { getTransactionHistory, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import useAsync from './useAsync'
import { selectTxHistory } from '@/store/txHistorySlice'
import useSafeInfo from './useSafeInfo'
import { fetchFilteredTxHistory, useTxFilter } from '@/utils/tx-history-filter'
import { localizeTxListDateLabelTimezone } from '@/utils/transactions'
import { useMemo } from 'react'

const useTxHistory = (
  pageUrl?: string,
): {
  page?: TransactionListPage
  error?: string
  loading: boolean
} => {
  const [filter] = useTxFilter()

  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId } = safe

  // If filter exists or pageUrl is passed, load a new history page from the API
  const [page, error, loading] = useAsync<TransactionListPage>(
    () => {
      if (!safeLoaded || !(filter || pageUrl)) return

      return filter
        ? fetchFilteredTxHistory(chainId, safeAddress, filter, pageUrl)
        : getTransactionHistory(chainId, safeAddress, pageUrl)
    },
    [chainId, safeAddress, safeLoaded, pageUrl, filter],
    false,
  )

  // The latest page of the history is always in the store
  const historyState = useAppSelector(selectTxHistory)

  // Return the new page or the stored page
  return useMemo(() => {
    const txHistory =
      filter || pageUrl
        ? {
            page,
            error: error?.message,
            loading: loading,
          }
        : {
            page: historyState.data,
            error: historyState.error,
            loading: historyState.loading,
          }

    return {
      ...txHistory,
      page: localizeTxListDateLabelTimezone(txHistory.page),
    }
  }, [error?.message, filter, historyState.data, historyState.error, historyState.loading, loading, page, pageUrl])
}

export default useTxHistory
