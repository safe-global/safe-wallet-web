import { useAppDispatch, useAppSelector } from '@/store'
import { clearPendingTx, setPendingTx, selectPendingTxsByChainId } from '@/store/pendingTxsSlice'
import { useEffect, useRef } from 'react'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import useChainId from './useChainId'
import { waitForTx } from '@/services/tx/txMonitor'
import { useInitWeb3 } from './wallets/useInitWeb3'

const pendingStatuses: Partial<Record<TxEvent, string | null>> = {
  [TxEvent.EXECUTING]: 'Submitting',
  [TxEvent.MINING]: 'Mining',
  [TxEvent.MINED]: 'Indexing',
  [TxEvent.SUCCESS]: null,
  [TxEvent.REVERTED]: null,
  [TxEvent.FAILED]: null,
}

const useTxPendingStatuses = (): void => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()

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
          dispatch(clearPendingTx({ chainId, txId }))
          return
        }

        // Or set a new status
        dispatch(
          setPendingTx({
            chainId,
            txId,
            status,
            txHash: 'txHash' in detail ? detail.txHash : undefined,
          }),
        )
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [dispatch, chainId])
}

export const useTxMonitor = (): void => {
  const chainId = useChainId()
  const pendingTxsOnChain = useAppSelector((state) => selectPendingTxsByChainId(state, chainId))
  const provider = useInitWeb3()

  // Prevent `waitForTx` from monitoring the same tx more than once
  const monitoredTxs = useRef<{ [txId: string]: boolean }>({})

  // Monitor pending transaction mining progress
  useEffect(() => {
    if (!provider || !pendingTxsOnChain) {
      return
    }

    for (const [txId, { txHash, status }] of Object.entries(pendingTxsOnChain)) {
      const isMining = status === pendingStatuses[TxEvent.MINING]
      const isMonitored = monitoredTxs.current[txId]

      if (!txHash || !isMining || isMonitored) {
        continue
      }

      monitoredTxs.current[txId] = true

      waitForTx(provider, txId, txHash)
    }
    // `provider` is updated when switching chains, re-running this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider])
}

export default useTxPendingStatuses
