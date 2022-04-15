import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from 'store'

type TxHistoryState = {
  page: TransactionListPage
  pageUrl?: string
}

const initialState: TxHistoryState = {
  page: {
    results: [],
    next: '',
    previous: '',
  },
}

export const txHistorySlice = createSlice({
  name: 'txHistory',
  initialState,
  reducers: {
    setHistoryPage: (state, action: PayloadAction<TransactionListPage | undefined>) => {
      state.page = action.payload || initialState.page
    },

    setPageUrl: (state, action: PayloadAction<string | undefined>) => {
      state.pageUrl = action.payload
    },
  },
})

export const { setHistoryPage, setPageUrl } = txHistorySlice.actions

export const selectTxHistory = (state: RootState): TxHistoryState => {
  return state[txHistorySlice.name]
}
