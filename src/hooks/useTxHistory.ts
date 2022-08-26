import { getTransactionHistory, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { useRouter } from 'next/router'
import { useAppSelector } from '@/store'
import useAsync from './useAsync'
import { selectTxHistory } from '@/store/txHistorySlice'
import useSafeInfo from './useSafeInfo'
import { getFilteredTxHistory, getTxFilter, getTxFilterType } from '@/utils/txHistoryFilter'

const useTxHistory = (
  pageUrl?: string,
): {
  page?: TransactionListPage
  error?: string
  loading: boolean
} => {
  const router = useRouter()
  const filterType = getTxFilterType(router.query)

  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId } = safe

  // If filter exists or pageUrl is passed, load a new history page from the API
  const [page, error, loading] = useAsync<TransactionListPage>(
    () => {
      if (!safeLoaded || !(filterType || pageUrl)) return

      if (!filterType) {
        return getTransactionHistory(chainId, safeAddress, pageUrl)
      }

      const filter = getTxFilter(router.query)
      if (filter) {
        return getFilteredTxHistory(chainId, safeAddress, filterType, filter, pageUrl)
      }
    },
    [chainId, safeAddress, safeLoaded, pageUrl, router.query, filterType],
    false,
  )

  // The latest page of the history is always in the store
  const historyState = useAppSelector(selectTxHistory)

  // Return the new page or the stored page
  return filterType || pageUrl
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
