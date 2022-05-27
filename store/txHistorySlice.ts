import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { Loadable } from './common'

interface TxHistoryState extends Loadable {
  page: TransactionListPage
  pageUrl?: string
}

const initialState: TxHistoryState = {
  error: undefined,
  loading: true,
  page: {
    results: [],
    next: '',
    previous: '',
  },
  pageUrl: '',
}

export type SetHistoryPageAction = PayloadAction<TransactionListPage | undefined>

export const txHistorySlice = createSlice({
  name: 'txHistory',
  initialState,
  reducers: {
    setHistoryPage: (state, action: SetHistoryPageAction) => {
      // @ts-ignore: Type instantiation is excessively deep and possibly infinite.
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
