import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { TxFlow } from '@/components/tx-flow'

export type NewTxsState = {
  [id: string]: TxFlow
}

const initialState: NewTxsState = {}

export const newTxsSlice = createSlice({
  name: 'newTxs',
  initialState,
  reducers: {
    setNewTx: (state, action: PayloadAction<{ id: string; txFlow: TxFlow }>) => {
      state[action.payload.id] = action.payload.txFlow
    },
    clearNewTx: (state, action: PayloadAction<string>) => {
      delete state[action.payload]
    },
  },
})

export const { setNewTx, clearNewTx } = newTxsSlice.actions

const selectNewTxs = (state: RootState): NewTxsState => {
  return state[newTxsSlice.name]
}

export const selectNewTxById = createSelector(
  [selectNewTxs, (_: RootState, id: string) => id],
  (newTxs, id) => newTxs[id],
)
