import { useEffect, useState } from 'react'
import { getTransactionQueue, type TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'

export const useLoadTxQueue = (): AsyncResult<TransactionListPage> => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId, txQueuedTag, txHistoryTag } = safe
  const [proposedId, setProposedId] = useState<string>('')
  // N.B. we reload when txQueuedTag/txHistoryTag/proposedId changes as txQueuedTag alone is not enough
  const reloadTag = (txQueuedTag ?? '') + (txHistoryTag ?? '') + proposedId

  // Re-fetch when chainId/address, or txQueueTag change
  const [data, error, loading] = useAsync<TransactionListPage>(
    () => {
      if (!safeLoaded) return
      if (!safe.deployed) return Promise.resolve({ results: [] })

      return getTransactionQueue(chainId, safeAddress)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeLoaded, chainId, safeAddress, reloadTag, safe.deployed],
    false,
  )

  // Track proposed txs so that we can reload the queue when they are added
  useEffect(() => {
    const unsubscribe = txSubscribe(TxEvent.PROPOSED, ({ txId }) => {
      setProposedId(txId)
    })
    return unsubscribe
  }, [])

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._603, error.message)
  }, [error])

  return [data, error, loading]
}

export default useLoadTxQueue
