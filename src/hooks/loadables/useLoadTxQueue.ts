import { useEffect, useState } from 'react'
import { getTransactionQueue, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'

const PROPOSAL_EVENTS: (TxEvent.PROPOSED | TxEvent.SIGNATURE_PROPOSED)[] = [
  TxEvent.PROPOSED,
  TxEvent.SIGNATURE_PROPOSED,
]

export const useLoadTxQueue = (): AsyncResult<TransactionListPage> => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId, txQueuedTag, txHistoryTag } = safe
  const [proposedTxId, setProposedTxId] = useState<string>()

  // Listen to newly proposed txns
  useEffect(() => {
    const unsubFns = PROPOSAL_EVENTS.map((event) => {
      return txSubscribe(event, ({ txId, tx }) => {
        // User may propose tx, switch wallet and propose signature which would not
        // trigger getTransactionQueue as proposedTxId wouldn't change
        const uniqId = `${tx.signatures.size}_${txId}`

        setProposedTxId(uniqId)
      })
    })

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [])

  // Re-fetch when chainId/address, or txQueueTag change
  const [data, error, loading] = useAsync<TransactionListPage | undefined>(
    async () => {
      if (!safeLoaded) return
      return getTransactionQueue(chainId, safeAddress)
    },
    // N.B. we reload when either txQueuedTag or txHistoryTag changes
    // @TODO: evaluate if txHistoryTag should be included in the reload
    [safeLoaded, chainId, safeAddress, txQueuedTag, txHistoryTag, proposedTxId],
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
