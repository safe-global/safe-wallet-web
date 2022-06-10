import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

type PendingTxsState =
  | {
      [chainId: string]: {
        [txId: string]: {
          status: string
          txHash?: string
        }
      }
    }
  | Record<string, never>

const initialState: PendingTxsState = {}

export const pendingTxsSlice = createSlice({
  name: 'pendingTxs',
  initialState,
  reducers: {
    setPendingTx: (
      state,
      action: PayloadAction<{ chainId: string; txId: string; txHash?: string; status: string }>,
    ) => {
      const { chainId, txId, ...pendingTx } = action.payload
      state[chainId] ??= {}
      state[chainId][txId] = state[chainId][txId] ? { ...state[chainId][txId], ...pendingTx } : pendingTx
    },
    clearPendingTx: (state, action: PayloadAction<{ chainId: string; txId: string }>) => {
      const { chainId, txId } = action.payload
      delete state[chainId]?.[txId]
      if (Object.keys(state[chainId]).length === 0) {
        delete state[chainId]
      }
    },
  },
})

export const { setPendingTx, clearPendingTx } = pendingTxsSlice.actions

export const selectPendingTxs = (state: RootState): PendingTxsState => {
  return state[pendingTxsSlice.name]
}

export const selectPendingTxsByChainId = createSelector(
  [selectPendingTxs, (_: RootState, chainId: string) => chainId],
  (pendingTxs, chainId) => pendingTxs?.[chainId],
)
