import { useAppDispatch } from '@/store'
import { clearPendingTx, setPendingTx } from '@/store/pendingTxsSlice'
import { useEffect } from 'react'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import useChainId from './useChainId'

const pendingStatuses: Partial<Record<TxEvent, string>> = {
  [TxEvent.EXECUTING]: 'Submitting',
  [TxEvent.MINING]: 'Mining',
  [TxEvent.MINED]: 'Indexing',
}

const finishedStatuses: Partial<Record<TxEvent, string>> = {
  [TxEvent.SUCCESS]: 'Success',
  [TxEvent.REVERTED]: 'Reverted',
  [TxEvent.FAILED]: 'Failed',
}

const useTxPendingStatuses = (): void => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()

  // Subscribe to pending statuses
  useEffect(() => {
    const unsubFns = Object.entries(pendingStatuses)
      .map(([event, status]) =>
        txSubscribe(event as TxEvent, (detail) => {
          if (!('txId' in detail) || !detail.txId) return

          dispatch(
            setPendingTx({
              chainId,
              txId: detail.txId,
              status,
              txHash: 'txHash' in detail ? detail.txHash : undefined,
            }),
          )
        }),
      )
      .filter(Boolean)

    return () => {
      unsubFns.forEach((unsub) => unsub?.())
    }
  }, [dispatch, chainId])

  // Subscribe to finished statuses
  useEffect(() => {
    const unsubFns = Object.entries(finishedStatuses)
      .map(([event]) =>
        txSubscribe(event as TxEvent, (detail) => {
          if (!('txId' in detail) || !detail.txId) return

          dispatch(
            clearPendingTx({
              txId: detail.txId,
            }),
          )
        }),
      )
      .filter(Boolean)

    return () => {
      unsubFns.forEach((unsub) => unsub?.())
    }
  }, [dispatch])
}

export default useTxPendingStatuses
