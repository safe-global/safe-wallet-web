import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getTransactionHistory, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'

import { logError, Errors } from '@/services/exceptions'
import {
  getFulfilledState,
  getPendingState,
  getRejectedState,
  initialThunkState,
  isRaceCondition,
  type ThunkState,
} from '@/store/thunkState'
import type { RootState } from '@/store'

type TxHistoryState = {
  page: TransactionListPage
} & ThunkState

const initialState: TxHistoryState = {
  page: {
    results: [],
    next: '',
    previous: '',
  },
  ...initialThunkState,
}

export const txHistorySlice = createSlice({
  name: 'txHistory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTxHistory.pending, (state, action) => {
      if (isRaceCondition(state, action)) return
      Object.assign(state, getPendingState(action))
    })
    builder.addCase(fetchTxHistory.fulfilled, (state, action) => {
      if (isRaceCondition(state, action)) return
      Object.assign(state, getFulfilledState(action), { page: action.payload })
    })
    builder.addCase(fetchTxHistory.rejected, (state, action) => {
      if (isRaceCondition(state, action)) return
      Object.assign(state, getRejectedState(action))

      logError(Errors._602, action.error.message)
    })
  },
})

export const fetchTxHistory = createAsyncThunk<
  TransactionListPage,
  { chainId: string; address: string; pageUrl?: string }
>(`${txHistorySlice.name}/fetchTxHistory`, async ({ chainId, address, pageUrl }) => {
  return await getTransactionHistory(chainId, address, pageUrl)
})

export const selectTxHistory = (state: RootState): TxHistoryState => {
  return state[txHistorySlice.name]
}
