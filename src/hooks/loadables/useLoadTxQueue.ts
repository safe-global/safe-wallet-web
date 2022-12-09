import { useEffect } from 'react'
import { getTransactionQueue, type TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'

export const useLoadTxQueue = (): AsyncResult<TransactionListPage> => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId, txQueuedTag, txHistoryTag } = safe

  // Re-fetch when chainId/address, or txQueueTag change
  const [data, error, loading] = useAsync<TransactionListPage | undefined>(
    async () => {
      if (!safeLoaded) return
      return getTransactionQueue(chainId, safeAddress)
    },
    // N.B. we reload when txQueuedTag/txHistoryTag changes as txQueuedTag is not reliable
    [safeLoaded, chainId, safeAddress, txQueuedTag, txHistoryTag],
    false,
  )

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._603, error.message)
  }, [error])

  return [data, error, loading]
}

export default useLoadTxQueue
