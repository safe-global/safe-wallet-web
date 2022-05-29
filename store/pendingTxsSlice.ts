import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import { SetHistoryPageAction, txHistorySlice } from './txHistorySlice'
import { isTransaction } from '@/components/transactions/utils'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'

interface PendingTxsState {
  [txId: string]: {
    chainId: string
    status: string
    txHash?: string
  }
}

const initialState: PendingTxsState = {}

export const pendingTxsSlice = createSlice({
  name: 'pendingTxs',
  initialState,
  reducers: {
    setPendingTx: (
      state,
      action: PayloadAction<{ chainId: string; txId: string; txHash?: string; status: string }>,
    ) => {
      const { txId, ...pendingTx } = action.payload
      state[txId] = pendingTx
    },
    clearPendingTx: (state, action: PayloadAction<{ txId: string }>) => {
      const { txId } = action.payload
      if (state[txId]) {
        delete state[txId]
      }
    },
  },

  extraReducers: (builder) => {
    builder.addMatcher(
      // Remove pending transaction when it is loaded in the history list
      (action) => action.type === txHistorySlice.actions.setHistoryPage.type,
      (state, action: SetHistoryPageAction) => {
        if (!action.payload) {
          return
        }

        for (const result of action.payload.results) {
          if (!isTransaction(result)) {
            continue
          }
          const { id } = result.transaction
          const pendingTx = state[id]
          if (pendingTx) {
            // A small timeout to avoid triggering triggering another reducer immediately
            setTimeout(() => {
              txDispatch(TxEvent.SUCCESS, { txId: id })
            }, 100)
          }
        }
      },
    )
  },
})

export const { setPendingTx, clearPendingTx } = pendingTxsSlice.actions

export const selectPendingTxs = (state: RootState): PendingTxsState => {
  return state[pendingTxsSlice.name]
}

export const selectPendingTxById = createSelector(
  [selectPendingTxs, (_, txId: string) => txId],
  (state, txId) => state[txId],
)
