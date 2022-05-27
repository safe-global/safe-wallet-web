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
            delete state[id]
            txDispatch(TxEvent.SUCCESS, { txId: id })
          }
        }
      },
    )
  },
})

export const { setPendingTx } = pendingTxsSlice.actions

export const selectPendingTxs = (state: RootState): PendingTxsState => {
  return state[pendingTxsSlice.name]
}

export const selectPendingTxById = createSelector(
  [selectPendingTxs, (_, txId: string) => txId],
  (state, txId) => state[txId],
)
