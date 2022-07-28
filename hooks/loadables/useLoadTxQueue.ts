import { useEffect, useState } from 'react'
import { getTransactionQueue, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'

export const useLoadTxQueue = (): AsyncResult<TransactionListPage> => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId, txQueuedTag, txHistoryTag } = safe
  const [proposedHash, setProposedHash] = useState<string>()

  // Listen to newly proposed txns
  useEffect(() => {
    return txSubscribe(TxEvent.PROPOSED, ({ txHash }) => setProposedHash(txHash))
  }, [])

  // Re-fetch when chainId/address, or txQueueTag change
  const [data, error, loading] = useAsync<TransactionListPage | undefined>(
    async () => {
      if (!safeLoaded) return
      return getTransactionQueue(chainId, safeAddress)
    },
    // N.B. we reload when either txQueuedTag or txHistoryTag changes
    // @TODO: evaluate if txHistoryTag should be included in the reload
    [safeLoaded, chainId, safeAddress, txQueuedTag, txHistoryTag, proposedHash],
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
