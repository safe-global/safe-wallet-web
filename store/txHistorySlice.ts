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
      if (!isRaceCondition(state, action)) {
        state = getPendingState(state, action)
      }
    })
    // @ts-ignore - "Type instantiation is excessively deep and possibly infinite"
    builder.addCase(fetchTxHistory.fulfilled, (state, action) => {
      if (!isRaceCondition(state, action)) {
        return {
          ...getFulfilledState(state, action),
          ...action.payload,
        }
      }
    })
    builder.addCase(fetchTxHistory.rejected, (state, action) => {
      if (!isRaceCondition(state, action)) {
        state = getRejectedState(state, action)

        logError(Errors._602, action.error.message)
      }
    })
  },
})

export const fetchTxHistory = createAsyncThunk(
  `${txHistorySlice.name}/fetchTxHistory`,
  async ({ chainId, address, pageUrl }: { chainId: string; address: string; pageUrl?: string }) => {
    return await getTransactionHistory(chainId, address, pageUrl)
  },
)

export const selectTxHistory = (state: RootState): TxHistoryState => {
  return state[txHistorySlice.name]
}
