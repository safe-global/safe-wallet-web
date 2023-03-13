import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

export enum PendingStatus {
  SIGNING = 'SIGNING',
  SUBMITTING = 'SUBMITTING',
  PROCESSING = 'PROCESSING',
  INDEXING = 'INDEXING',
}

export type PendingTx = {
  chainId: string
  status: PendingStatus
  txHash?: string
  groupKey?: string
  signerAddress?: string
}

type PendingTxsState = {
  [txId: string]: PendingTx
}

const initialState: PendingTxsState = {}

export const pendingTxsSlice = createSlice({
  name: 'pendingTxs',
  initialState,
  reducers: {
    setPendingTx: (
      state,
      action: PayloadAction<{
        chainId: string
        txId: string
        txHash?: string
        groupKey?: string
        status: PendingStatus
        signerAddress?: string
      }>,
    ) => {
      const { txId, ...pendingTx } = action.payload
      state[txId] = pendingTx
    },
    clearPendingTx: (state, action: PayloadAction<{ txId: string }>) => {
      delete state[action.payload.txId]
    },
  },
})

export const { setPendingTx, clearPendingTx } = pendingTxsSlice.actions

export const selectPendingTxs = (state: RootState): PendingTxsState => {
  return state[pendingTxsSlice.name]
}

export const selectPendingTxById = createSelector(
  [selectPendingTxs, (_: RootState, txId: string) => txId],
  (pendingTxs, txId) => pendingTxs[txId],
)
