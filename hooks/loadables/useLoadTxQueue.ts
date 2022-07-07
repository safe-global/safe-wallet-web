import { useEffect } from 'react'
import { getTransactionQueue, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'

export const useLoadTxQueue = (): AsyncResult<TransactionListPage> => {
  const { safe } = useSafeInfo()
  const { chainId, txQueuedTag } = safe || {}
  const address = safe?.address.value

  // Re-fetch when chainId/address, or txQueueTag change
  const [data, error, loading] = useAsync<TransactionListPage | undefined>(
    async () => {
      if (chainId && address) {
        return getTransactionQueue(chainId, address)
      }
    },
    [chainId, address, txQueuedTag],
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
