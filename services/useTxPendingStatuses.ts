import { useAppDispatch } from '@/store'
import { setPendingTx } from '@/store/pendingTxsSlice'
import { useEffect } from 'react'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import useChainId from './useChainId'

const pendingStatuses: Partial<Record<TxEvent, string>> = {
  [TxEvent.EXECUTING]: 'Submitting',
  [TxEvent.MINING]: 'Mining',
  [TxEvent.MINED]: 'Indexing',
}

const useTxPendingStatuses = (): void => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()

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
}

export default useTxPendingStatuses
