import { getTransactionHistory, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { createAsyncThunk, createSlice, PayloadAction, SerializedError } from '@reduxjs/toolkit'

import { GATEWAY_URL } from 'config/constants'
import { LOADING_STATUS } from 'store/commonTypes'
import type { RootState } from 'store'
import { Errors, logError } from 'services/exceptions/CodedException'

type TxHistoryState = {
  page: TransactionListPage
  pageUrl?: string
  status: LOADING_STATUS
  error?: SerializedError
}

const initialState: TxHistoryState = {
  page: {
    results: [],
    next: '',
    previous: '',
  },
  pageUrl: '',
  status: LOADING_STATUS.IDLE,
  error: undefined,
}

export const txHistorySlice = createSlice({
  name: 'txHistory',
  initialState,
  reducers: {
    setPageUrl: (state, action: PayloadAction<TxHistoryState['pageUrl']>) => {
      state.pageUrl = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTxHistory.pending, (state) => {
      state.status = LOADING_STATUS.PENDING
      state.error = undefined
    })

    builder.addCase(fetchTxHistory.fulfilled, (state, { payload }) => {
      state.status = LOADING_STATUS.SUCCEEDED
      state.page = payload
    })

    builder.addCase(fetchTxHistory.rejected, (state, { error }) => {
      state.status = LOADING_STATUS.FAILED
      state.error = error

      logError(Errors._602, error.message)
    })
  },
})

export const { setPageUrl } = txHistorySlice.actions

export const fetchTxHistory = createAsyncThunk(
  `${txHistorySlice.name}/fetchTxHistory`,
  ({ chainId, address, pageUrl }: { chainId: string; address: string; pageUrl?: string }) => {
    return getTransactionHistory(GATEWAY_URL, chainId, address, pageUrl)
  },
)

export const selectTxHistory = (state: RootState): TxHistoryState => {
  return state[txHistorySlice.name]
}
