import { useAppDispatch, useAppSelector } from '@/store'
import { clearPendingTx, setPendingTx, selectPendingTxs, PendingStatus } from '@/store/pendingTxsSlice'
import { useEffect, useMemo, useRef } from 'react'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import useChainId from './useChainId'
import { waitForTx } from '@/services/tx/txMonitor'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useTxHistory from './useTxHistory'
import { isTransactionListItem } from '@/utils/transaction-guards'

const pendingStatuses: Partial<Record<TxEvent, PendingStatus | null>> = {
  [TxEvent.SIGNATURE_PROPOSED]: PendingStatus.SIGNING,
  [TxEvent.SIGNATURE_INDEXED]: null,
  [TxEvent.EXECUTING]: PendingStatus.SUBMITTING,
  [TxEvent.PROCESSING]: PendingStatus.PROCESSING,
  [TxEvent.PROCESSED]: PendingStatus.INDEXING,
  [TxEvent.SUCCESS]: null,
  [TxEvent.REVERTED]: null,
  [TxEvent.FAILED]: null,
}

const useTxMonitor = (): void => {
  const chainId = useChainId()
  const pendingTxs = useAppSelector(selectPendingTxs)
  const pendingTxEntriesOnChain = Object.entries(pendingTxs).filter(([, pendingTx]) => pendingTx.chainId === chainId)
  const provider = useWeb3ReadOnly()

  // Prevent `waitForTx` from monitoring the same tx more than once
  const monitoredTxs = useRef<{ [txId: string]: boolean }>({})

  // Monitor pending transaction mining/validating progress
  useEffect(() => {
    if (!provider || !pendingTxEntriesOnChain) {
      return
    }

    for (const [txId, { txHash, status }] of pendingTxEntriesOnChain) {
      const isProcessing = status === PendingStatus.PROCESSING
      const isMonitored = monitoredTxs.current[txId]

      if (!txHash || !isProcessing || isMonitored) {
        continue
      }

      monitoredTxs.current[txId] = true

      waitForTx(provider, txId, txHash)
    }
    // `provider` is updated when switching chains, re-running this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider])
}

const useTxPendingStatuses = (): void => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const txHistory = useTxHistory()
  const historicalTxs = useMemo(() => {
    return txHistory.page?.results?.filter(isTransactionListItem) || []
  }, [txHistory.page?.results])

  useTxMonitor()

  // Subscribe to pending statuses
  useEffect(() => {
    const unsubFns = Object.entries(pendingStatuses).map(([event, status]) =>
      txSubscribe(event as TxEvent, (detail) => {
        // All pending txns should have a txId
        const txId = 'txId' in detail && detail.txId
        if (!txId) return

        // Clear the pending status if the tx is no longer pending
        const isFinished = status === null
        if (isFinished) {
          dispatch(clearPendingTx({ txId }))
          return
        }

        // If we have future issues with statuses, we should refactor `useTxPendingStatuses`
        // @see https://github.com/safe-global/web-core/issues/1754
        const isIndexed = historicalTxs.some((tx) => tx.transaction.id === txId)

        if (!isIndexed) {
          // Or set a new status
          dispatch(
            setPendingTx({
              chainId,
              txId,
              status,
              txHash: 'txHash' in detail ? detail.txHash : undefined,
              groupKey: 'groupKey' in detail ? detail.groupKey : undefined,
              signerAddress: `signerAddress` in detail ? detail.signerAddress : undefined,
            }),
          )
        }
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [dispatch, chainId, historicalTxs])
}

export default useTxPendingStatuses
