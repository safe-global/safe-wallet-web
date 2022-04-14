import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from 'store'

type TxHistoryState = TransactionListPage

const initialState: TxHistoryState = {
  results: [],
  next: '',
  previous: '',
}

export const txHistorySlice = createSlice({
  name: 'txHistory',
  initialState,
  reducers: {
    setTxHistory: (_, action: PayloadAction<TransactionListPage | undefined>): TxHistoryState => {
      return action.payload || initialState
    },
  },
})

export const { setTxHistory } = txHistorySlice.actions

export const selectTxHistory = (state: RootState): TxHistoryState => {
  return state[txHistorySlice.name]
}
