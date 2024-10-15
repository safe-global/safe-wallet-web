import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TransactionItem, TransactionItemPage } from 'safe-client-gateway-sdk'
import { RootState } from '.'

const initialState: TransactionItemPage = { results: [] }

const txHistory = createSlice({
  name: 'txHistory',
  initialState,
  reducers: {
    // TODO: this will be removed in the next task
    // it is here just to test the action
    addTx: (state, action: PayloadAction<{ item: TransactionItem }>) => {
      state.results.push(action.payload.item)
    },
  },
})

export const { addTx } = txHistory.actions

export const txHistorySelector = (state: RootState) => state.txHistory

export default txHistory.reducer
