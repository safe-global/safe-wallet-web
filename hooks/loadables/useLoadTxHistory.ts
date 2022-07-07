import { useEffect } from 'react'
import { getTransactionHistory, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import { Errors, logError } from '@/services/exceptions'
import useSafeInfo from '../useSafeInfo'

export const useLoadTxHistory = (): AsyncResult<TransactionListPage> => {
  const { safe } = useSafeInfo()
  const { chainId, txHistoryTag } = safe || {}
  const address = safe?.address.value

  // Re-fetch when chainId/address, or txHistoryTag change
  const [data, error, loading] = useAsync<TransactionListPage | undefined>(
    async () => {
      if (chainId && address) {
        return getTransactionHistory(chainId, address)
      }
    },
    [chainId, address, txHistoryTag],
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
