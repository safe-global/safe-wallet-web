import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import { gatewayApi } from '@/store/gatewayApi'
import { isTransaction } from '@/utils/transaction-guards'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'

type PendingTxsState =
  | {
      [txId: string]: {
        chainId: string
        status: string
        txHash?: string
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
      const { txId, ...pendingTx } = action.payload
      state[txId] = pendingTx
    },
    clearPendingTx: (state, action: PayloadAction<{ txId: string }>) => {
      delete state[action.payload.txId]
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(gatewayApi.endpoints.getTxHistory.matchFulfilled, (state, { payload }) => {
      for (const result of payload.results) {
        if (!isTransaction(result)) {
          continue
        }

        const { id } = result.transaction

        if (state[id]) {
          txDispatch(TxEvent.SUCCESS, { txId: id })
        }
      }
    })
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
