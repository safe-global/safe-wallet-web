import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getTransactionQueue, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'

import { logError, Errors } from '@/services/exceptions'
import {
  getFulfilledState,
  getPendingState,
  getRejectedState,
  initialThunkState,
  type ThunkState,
} from '@/store/thunkState'
import type { RootState } from '@/store'

type TxQueueState = {
  page: TransactionListPage
} & ThunkState

const initialState: TxQueueState = {
  page: {
    results: [],
    next: '',
    previous: '',
  },
  ...initialThunkState,
}

export const txQueueSlice = createSlice({
  name: 'txQueue',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTxQueue.pending, (state, action) => {
      Object.assign(state, getPendingState(action))
    })
    builder.addCase(fetchTxQueue.fulfilled, (state, action) => {
      Object.assign(state, getFulfilledState(action), { page: action.payload })
    })
    builder.addCase(fetchTxQueue.rejected, (state, action) => {
      Object.assign(state, getRejectedState(action))

      logError(Errors._603, action.error.message)
    })
  },
})

export const fetchTxQueue = createAsyncThunk<
  TransactionListPage,
  { chainId: string; address: string; pageUrl?: string }
>(`${txQueueSlice.name}/fetchTxQueue`, async ({ chainId, address, pageUrl }) => {
  return await getTransactionQueue(chainId, address, pageUrl)
})

export const selectTxQueue = (state: RootState): TxQueueState => {
  return state[txQueueSlice.name]
}
