import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getTransactionQueue, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'

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
      if (!isRaceCondition(state, action)) {
        state = getPendingState(state, action)
      }
    })
    // @ts-ignore - "Type instantiation is excessively deep and possibly infinite"
    builder.addCase(fetchTxQueue.fulfilled, (state, action) => {
      if (!isRaceCondition(state, action)) {
        return {
          ...getFulfilledState(state, action),
          page: action.payload,
        }
      }
    })
    builder.addCase(fetchTxQueue.rejected, (state, action) => {
      if (!isRaceCondition(state, action)) {
        state = getRejectedState(state, action)

        logError(Errors._603, action.error.message)
      }
    })
  },
})

export const fetchTxQueue = createAsyncThunk(
  `${txQueueSlice.name}/fetchTxQueue`,
  async ({ chainId, address, pageUrl }: { chainId: string; address: string; pageUrl?: string }) => {
    return await getTransactionQueue(chainId, address, pageUrl)
  },
)

export const selectTxQueue = (state: RootState): TxQueueState => {
  return state[txQueueSlice.name]
}
