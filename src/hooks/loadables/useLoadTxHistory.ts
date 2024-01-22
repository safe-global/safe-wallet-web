import { useEffect } from 'react'
import { type TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import { Errors, logError } from '@/services/exceptions'
import useSafeInfo from '../useSafeInfo'
import { getTxHistory } from '@/services/transactions'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'

export const useLoadTxHistory = (): AsyncResult<TransactionListPage> => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId, txHistoryTag } = safe
  const { showOnlyTrustedTransactions } = useAppSelector(selectSettings)

  // Re-fetch when chainId, address, showOnlyTrustedTransactions, or txHistoryTag changes
  const [data, error, loading] = useAsync<TransactionListPage>(
    () => {
      if (!safeLoaded) return
      if (!safe.deployed) return Promise.resolve({ results: [] })
      return getTxHistory(chainId, safeAddress, showOnlyTrustedTransactions)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeLoaded, chainId, safeAddress, showOnlyTrustedTransactions, txHistoryTag],
    false,
  )

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._602, error.message)
  }, [error])

  return [data, error, loading]
}

export default useLoadTxHistory
