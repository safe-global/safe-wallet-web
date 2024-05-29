import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import type { RootState } from '.'

export type DraftBatchItem = {
  id: string
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
        txDetails: TransactionDetails
      }>,
    ) => {
      const { chainId, safeAddress, txDetails } = action.payload
      state[chainId] = state[chainId] || {}
      state[chainId][safeAddress] = state[chainId][safeAddress] || []
      // @ts-expect-error
      state[chainId][safeAddress].push({
        id: Math.random().toString(36).slice(2),
        timestamp: Date.now(),
        // @ts-expect-error
        txDetails,
      })
    },

    // Remove a tx to the batch by txId
    removeTx: (
      state,
      action: PayloadAction<{
        chainId: string
        safeAddress: string
        id: string
      }>,
    ) => {
      const { chainId, safeAddress, id } = action.payload
      state[chainId] = state[chainId] || {}
      state[chainId][safeAddress] = state[chainId][safeAddress] || []
      state[chainId][safeAddress] = state[chainId][safeAddress].filter((item) => item.id !== id)
    },
  },
})

export const { addTx, removeTx } = batchSlice.actions

const selectAllBatches = (state: RootState): BatchTxsState => {
  return state[batchSlice.name] || initialState
}

export const selectBatchBySafe = createSelector(
  [selectAllBatches, (_, chainId: string, safeAddress: string) => [chainId, safeAddress]],
  (allBatches, [chainId, safeAddress]): DraftBatchItem[] => {
    return allBatches[chainId]?.[safeAddress] || []
  },
)
