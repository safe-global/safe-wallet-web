import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'

// A map of chain ids to a batch tx id
type BatchTxsState = {
  [chainId: string]: {
    [safeAddress: string]: string
  }
}

const initialState: BatchTxsState = {}

export const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
    replaceBatch: (
      state,
      action: PayloadAction<{
        chainId: string
        safeAddress: string
        txId: string
      }>,
    ) => {
      const { chainId, safeAddress, txId } = action.payload
      state[chainId] = state[chainId] || {}
      state[chainId][safeAddress] = txId
    },
    removeBatch: (
      state,
      action: PayloadAction<{
        chainId: string
        safeAddress: string
      }>,
    ) => {
      const { chainId, safeAddress } = action.payload
      if (state[chainId]) {
        delete state[chainId][safeAddress]
      }
    },
  },
})

export const { replaceBatch, removeBatch } = batchSlice.actions

const selectAllBatches = (state: RootState): BatchTxsState => {
  return state[batchSlice.name]
}

export const selectBatchBySafe = createSelector(
  [selectAllBatches, (_, chainId: string, safeAddress: string) => [chainId, safeAddress]],
  (allBatchs, [chainId, safeAddress]): string | null => {
    return allBatchs[chainId]?.[safeAddress] || null
  },
)
