import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'
import { TransactionItemPage } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'

const initialState: TransactionItemPage = { results: [] }

const txHistorySlice = createSlice({
  name: 'txHistory',
  initialState,
  reducers: {
    // TODO: this will be removed in the next task
    // it is here just to test the action
    addTx: (state, action: PayloadAction<{ item: TransactionItemPage['results'][number] }>) => {
      state.results.push(action.payload.item)
    },
  },
})

export const { addTx } = txHistorySlice.actions

export const txHistorySelector = (state: RootState) => state.txHistory

export default txHistorySlice.reducer
