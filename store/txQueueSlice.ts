import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { Loadable } from './common'

interface TxQueueState extends Loadable {
  page: TransactionListPage
  pageUrl?: string
}

const initialState: TxQueueState = {
  error: undefined,
  loading: true,
  page: {
    results: [],
    next: '',
    previous: '',
  },
  pageUrl: '',
}

export const txQueueSlice = createSlice({
  name: 'txQueue',
  initialState,
  reducers: {
    setQueuePage: (state, action: PayloadAction<TransactionListPage | undefined>) => {
      // @ts-ignore: Type instantiation is excessively deep and possibly infinite.
      state.page = action.payload || initialState.page
    },

    setPageUrl: (state, action: PayloadAction<string | undefined>) => {
      state.pageUrl = action.payload
    },
  },
})

export const { setQueuePage, setPageUrl } = txQueueSlice.actions

export const selectTxQueue = (state: RootState): TxQueueState => {
  return state[txQueueSlice.name]
}
