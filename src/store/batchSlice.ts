import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import type { RootState } from '.'

export type DraftBatchItem = {
  timestamp: number
  txDetails: TransactionDetails
}

type BatchTxsState = {
  [chainId: string]: {
    [safeAddress: string]: DraftBatchItem[]
  }
}

const initialState: BatchTxsState = {}

export const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
    // Add a tx to the batch
    addTx: (
      state,
      action: PayloadAction<{
        chainId: string
        safeAddress: string
        timestamp: number
        txDetails: TransactionDetails
      }>,
    ) => {
      const { chainId, safeAddress, ...data } = action.payload
      state[chainId] = state[chainId] || {}
      state[chainId][safeAddress] = state[chainId][safeAddress] || []
      // @ts-ignore
      state[chainId][safeAddress].push(data)
    },

    // Remove a tx to the batch by txId
    removeTx: (
      state,
      action: PayloadAction<{
        chainId: string
        safeAddress: string
        txId: string
      }>,
    ) => {
      const { chainId, safeAddress, txId } = action.payload
      state[chainId] = state[chainId] || {}
      state[chainId][safeAddress] = state[chainId][safeAddress] || []
      state[chainId][safeAddress] = state[chainId][safeAddress].filter(
        (item: DraftBatchItem) => item.txDetails.txId !== txId,
      )
    },
  },
})

export const { addTx, removeTx } = batchSlice.actions

const selectAllBatches = (state: RootState): BatchTxsState => {
  return state[batchSlice.name]
}

export const selectBatchBySafe = createSelector(
  [selectAllBatches, (_, chainId: string, safeAddress: string) => [chainId, safeAddress]],
  (allBatchs, [chainId, safeAddress]): DraftBatchItem[] => {
    return allBatchs[chainId]?.[safeAddress] || []
  },
)
