import { getTransactionHistory, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { logError, Errors } from '@/services/exceptions'
import type { RootState } from '@/store'
import { initialFetchState, LOADING_STATUS, type FetchState } from '@/store/fetchThunkState'

type TxHistoryState = {
  page: TransactionListPage
} & FetchState

const initialState: TxHistoryState = {
  page: {
    results: [],
    next: '',
    previous: '',
  },
  ...initialFetchState,
}

export const txHistorySlice = createSlice({
  name: 'txHistory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTxHistory.pending, (state) => {
      state.status = LOADING_STATUS.PENDING
      state.error = undefined
    })
    builder.addCase(fetchTxHistory.fulfilled, (state, { payload }) => {
      state.status = LOADING_STATUS.SUCCEEDED
      Object.assign(state, payload)
    })
    builder.addCase(fetchTxHistory.rejected, (state, { error, meta }) => {
      if (meta.aborted) {
        return
      }

      state.status = LOADING_STATUS.FAILED
      state.error = error

      logError(Errors._602, error.message)
    })
  },
})

export const fetchTxHistory = createAsyncThunk(
  `${txHistorySlice.name}/fetchTxHistory`,
  async ({ chainId, address, pageUrl }: { chainId: string; address: string; pageUrl?: string }, { signal }) => {
    return await getTransactionHistory(chainId, address, pageUrl, signal)
  },
)

export const selectTxHistory = (state: RootState): TxHistoryState => {
  return state[txHistorySlice.name]
}
