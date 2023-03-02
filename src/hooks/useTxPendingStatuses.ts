import { useAppDispatch, useAppSelector } from '@/store'
import { clearPendingTx, setPendingTx, selectPendingTxs, PendingStatus } from '@/store/pendingTxsSlice'
import { useEffect, useRef } from 'react'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import useChainId from './useChainId'
import { waitForRelayedTx, waitForTx } from '@/services/tx/txMonitor'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'

const pendingStatuses: Partial<Record<TxEvent, PendingStatus | null>> = {
  [TxEvent.SIGNATURE_PROPOSED]: PendingStatus.SIGNING,
  [TxEvent.SIGNATURE_INDEXED]: null,
  [TxEvent.EXECUTING]: PendingStatus.SUBMITTING,
  [TxEvent.PROCESSING]: PendingStatus.PROCESSING,
  [TxEvent.PROCESSED]: PendingStatus.INDEXING,
  [TxEvent.RELAYING]: PendingStatus.RELAYING,
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

    for (const [txId, { txHash, status, taskId }] of pendingTxEntriesOnChain) {
      const isProcessing = status === PendingStatus.PROCESSING && txHash !== undefined
      const isMonitored = monitoredTxs.current[txId]
      const isRelaying = status === PendingStatus.RELAYING && taskId !== undefined

      if (!(isProcessing || isRelaying) || isMonitored) {
        continue
      }

      monitoredTxs.current[txId] = true

      if (isProcessing) {
        waitForTx(provider, txId, txHash)
      }

      if (isRelaying) {
        waitForRelayedTx(taskId, txId)
      }
    }
    // `provider` is updated when switching chains, re-running this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider])
}

const useTxPendingStatuses = (): void => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
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
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [dispatch, chainId])
}

export default useTxPendingStatuses
