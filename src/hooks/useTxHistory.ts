import { getTransactionHistory, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { useRouter } from 'next/router'
import { useAppSelector } from '@/store'
import useAsync from './useAsync'
import { selectTxHistory } from '@/store/txHistorySlice'
import useSafeInfo from './useSafeInfo'
import { getFilteredTxHistory, hasTxFilterQuery } from '@/utils/filter'

const useTxHistory = (
  pageUrl?: string,
): {
  page?: TransactionListPage
  error?: string
  loading: boolean
} => {
  const router = useRouter()
  const hasFilter = hasTxFilterQuery(router.query)

  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId } = safe

  // If pageUrl is passed, load a new history page from the API
  const [page, error, loading] = useAsync<TransactionListPage>(
    () => {
      if (!safeLoaded || !(hasFilter || pageUrl)) return

      return hasFilter
        ? getFilteredTxHistory(chainId, safeAddress, router.query, pageUrl)
        : getTransactionHistory(chainId, safeAddress, pageUrl)
    },
    [chainId, safeAddress, safeLoaded, pageUrl, router.query, hasFilter],
    false,
  )

  // The latest page of the history is always in the store
  const historyState = useAppSelector(selectTxHistory)

  // Return the new page or the stored page
  return hasFilter || pageUrl
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
}

export default useTxHistory
