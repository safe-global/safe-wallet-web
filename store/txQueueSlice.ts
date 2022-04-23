import { getTransactionQueue, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { logError, Errors } from '@/services/exceptions'
import { initialFetchState, LOADING_STATUS, type FetchState } from '@/store/fetchThunkState'
import type { RootState } from '@/store'

type TxQueueState = {
  page: TransactionListPage
} & FetchState

const initialState: TxQueueState = {
  page: {
    results: [],
    next: '',
    previous: '',
  },
  ...initialFetchState,
}

export const txQueueSlice = createSlice({
  name: 'txQueue',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTxQueue.pending, (state) => {
      state.status = LOADING_STATUS.PENDING
      state.error = undefined
    })
    builder.addCase(fetchTxQueue.fulfilled, (state, { payload }) => {
      state.status = LOADING_STATUS.SUCCEEDED
      Object.assign(state, payload)
    })
    builder.addCase(fetchTxQueue.rejected, (state, { error, meta }) => {
      if (meta.aborted) {
        return
      }

      state.status = LOADING_STATUS.FAILED
      state.error = error

      logError(Errors._603, error.message)
    })
  },
})

export const fetchTxQueue = createAsyncThunk(
  `${txQueueSlice.name}/fetchTxQueue`,
  async ({ chainId, address, pageUrl }: { chainId: string; address: string; pageUrl?: string }, { signal }) => {
    return await getTransactionQueue(chainId, address, pageUrl, signal)
  },
)

export const selectTxQueue = (state: RootState): TxQueueState => {
  return state[txQueueSlice.name]
}
