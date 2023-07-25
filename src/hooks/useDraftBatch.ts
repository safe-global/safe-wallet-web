import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import useChainId from './useChainId'
import useSafeAddress from './useSafeAddress'
import type { DraftBatchItem } from '@/store/batchSlice'
import { selectBatchBySafe, addTx, removeTx } from '@/store/batchSlice'
import { getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { BATCH_EVENTS, trackEvent } from '@/services/analytics'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'

export const useUpdateBatch = () => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const dispatch = useAppDispatch()

  const onAdd = useCallback(
    (id: string) => {
      getTransactionDetails(chainId, id).then((tx) => {
        dispatch(
          addTx({
            chainId,
            safeAddress,
            timestamp: Date.now(),
            txDetails: tx,
          }),
        )

        txDispatch(TxEvent.BATCH_ADD, { txId: id })

        trackEvent({ ...BATCH_EVENTS.BATCH_TX_APPENDED, label: tx.txInfo.type })
      })
    },
    [dispatch, chainId, safeAddress],
  )

  const onDelete = useCallback(
    (txId: string) => {
      dispatch(
        removeTx({
          chainId,
          safeAddress,
          txId,
        }),
      )
    },
    [dispatch, chainId, safeAddress],
  )

  return [onAdd, onDelete] as const
}

export const useDraftBatch = (): DraftBatchItem[] => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const batch = useAppSelector((state) => selectBatchBySafe(state, chainId, safeAddress))
  return batch
}
