import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { SetHistoryPageAction, txHistorySlice } from './txHistorySlice'
import { isTransaction } from '@/components/transactions/utils'
import type { RootState } from '@/store'

interface PendingTxsState {
  [txId: string]: true
}

const initialState: PendingTxsState = {}

export const pendingTxsSlice = createSlice({
  name: 'pendingTxs',
  initialState,
  reducers: {
    setPendingTx: (state, action: PayloadAction<{ txId: string }>) => {
      const { txId } = action.payload

      state[txId] = true
    },
    removePendingTx: (state, action: PayloadAction<{ txId: string }>) => {
      const { txId } = action.payload

      delete state[txId]
    },
  },
  extraReducers: (builder) => {
    // Remove any pending transactions that are now historical
    builder.addMatcher(
      ({ type }) => type === txHistorySlice.actions.setHistoryPage.type,
      (state, action: SetHistoryPageAction) => {
        if (!action.payload) {
          return
        }

        for (const result of action.payload.results) {
          if (!isTransaction(result)) {
            continue
          }

          const { id } = result.transaction

          delete state[id]
        }
      },
    )
  },
})

export const { setPendingTx, removePendingTx } = pendingTxsSlice.actions

export const selectPendingTxs = (state: RootState): PendingTxsState => {
  return state[pendingTxsSlice.name]
}
