import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import { sameAddress } from '@/utils/addresses'

export enum PendingStatus {
  SIGNING = 'SIGNING',
  SUBMITTING = 'SUBMITTING',
  PROCESSING = 'PROCESSING',
  RELAYING = 'RELAYING',
  INDEXING = 'INDEXING',
}

export type PendingTx = {
  chainId: string
  safeAddress: string
  status: PendingStatus
  txHash?: string
  groupKey?: string
  signerAddress?: string
  taskId?: string
}

export type PendingTxsState = {
  [txId: string]: PendingTx
}

const initialState: PendingTxsState = {}

export const pendingTxsSlice = createSlice({
  name: 'pendingTxs',
  initialState,
  reducers: {
    setPendingTx: (state, action: PayloadAction<PendingTx & { txId: string }>) => {
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

export const selectPendingTxIdsBySafe = createSelector(
  [selectPendingTxs, (_: RootState, chainId: string, safeAddress: string) => [chainId, safeAddress]],
  (pendingTxs, [chainId, safeAddress]) =>
    Object.keys(pendingTxs).filter(
      (id) => pendingTxs[id].chainId === chainId && sameAddress(pendingTxs[id].safeAddress, safeAddress),
    ),
)
