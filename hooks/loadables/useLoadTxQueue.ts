import { useEffect, useState } from 'react'
import { getTransactionQueue, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'

export const useLoadTxQueue = (): AsyncResult<TransactionListPage> => {
  const { safe } = useSafeInfo()
  const { chainId, txQueuedTag, txHistoryTag } = safe || {}
  const address = safe?.address.value
  const [proposedTxId, setProposedTxId] = useState<string>()

  // Listen to newly proposed txns
  useEffect(() => {
    return txSubscribe(TxEvent.PROPOSED, ({ txId }) => setProposedTxId(txId))
  }, [])

  // Re-fetch when chainId/address, or txQueueTag change
  const [data, error, loading] = useAsync<TransactionListPage | undefined>(
    async () => {
      if (chainId && address) {
        return getTransactionQueue(chainId, address)
      }
    },
    [chainId, address, txQueuedTag, txHistoryTag, proposedTxId],
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
