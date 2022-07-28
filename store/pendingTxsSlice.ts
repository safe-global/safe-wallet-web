import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

type PendingTx = {
  txHash: string
  chainId: string
  status: string
}

type PendingTxsState = Record<PendingTx['txHash'], PendingTx>

const initialState: PendingTxsState = {}

export const pendingTxsSlice = createSlice({
  name: 'pendingTxs',
  initialState,
  reducers: {
    setPendingTx: (state, action: PayloadAction<PendingTx>) => {
      const { txHash } = action.payload
      state[txHash] = action.payload
    },
    clearPendingTx: (state, action: PayloadAction<{ txHash: string }>) => {
      delete state[action.payload.txHash]
    },
  },
})

export const { setPendingTx, clearPendingTx } = pendingTxsSlice.actions

export const selectPendingTxs = (state: RootState): PendingTxsState => {
  return state[pendingTxsSlice.name]
}

export const selectPendingTxByHash = createSelector(
  [selectPendingTxs, (_: RootState, txHash: string) => txHash],
  (pendingTxs, txHash) => pendingTxs[txHash],
)
