import { useAppDispatch, useAppSelector } from '@/store'
import { clearPendingTx, setPendingTx, selectPendingTxs } from '@/store/pendingTxsSlice'
import { useEffect, useRef } from 'react'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import useChainId from './useChainId'
import { waitForTx } from '@/services/tx/txMonitor'
import { useWeb3ReadOnly } from '@/services/wallets/web3'

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
  const pendingTxs = useAppSelector(selectPendingTxs)
  const pendingTxEntriesOnChain = Object.entries(pendingTxs).filter(([, pendingTx]) => pendingTx.chainId === chainId)
  const provider = useWeb3ReadOnly()

  // Prevent `waitForTx` from monitoring the same tx more than once
  const monitoredTxs = useRef<{ [txId: string]: boolean }>({})

  // Monitor pending transaction mining progress
  useEffect(() => {
    if (!provider || !pendingTxEntriesOnChain) {
      return
    }

    for (const [txId, { txHash, status }] of pendingTxEntriesOnChain) {
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
