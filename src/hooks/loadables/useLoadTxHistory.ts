import { useEffect } from 'react'
import { getTransactionHistory, type TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import { Errors, logError } from '@/services/exceptions'
import useSafeInfo from '../useSafeInfo'

export const useLoadTxHistory = (): AsyncResult<TransactionListPage> => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId, txHistoryTag } = safe

  // Re-fetch when chainId/address, or txHistoryTag change
  const [data, error, loading] = useAsync<TransactionListPage | undefined>(
    async () => {
      if (!safeLoaded) return
      return getTransactionHistory(chainId, safeAddress)
    },
    [safeLoaded, chainId, safeAddress, txHistoryTag],
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
