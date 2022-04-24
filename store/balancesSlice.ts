import { getBalances, type SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { logError, Errors } from '@/services/exceptions'
import {
  getFulfilledState,
  getPendingState,
  getRejectedState,
  initialThunkState,
  isRaceCondition,
  type ThunkState,
} from './thunkState'
import type { RootState } from '@/store'

type BalancesState = SafeBalanceResponse & ThunkState

const initialState: BalancesState = {
  fiatTotal: '0',
  items: [],
  ...initialThunkState,
}

export const balancesSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBalances.pending, (state, action) => {
      if (!isRaceCondition(state, action)) {
        // Reset balance when fetching as it's a new Safe
        state = getPendingState(initialState, action)
      }
    })
    builder.addCase(fetchBalances.fulfilled, (state, action) => {
      if (!isRaceCondition(state, action)) {
        return {
          ...getFulfilledState(state, action),
          ...action.payload,
        }
      }
    })
    builder.addCase(fetchBalances.rejected, (state, action) => {
      if (!isRaceCondition(state, action)) {
        state = getRejectedState(state, action)

        logError(Errors._601, action.error.message)
      }
    })
  },
})

export const fetchBalances = createAsyncThunk(
  `${balancesSlice.name}/fetchBalances`,
  async ({ chainId, address }: { chainId: string; address: string }) => {
    return await getBalances(chainId, address)
  },
)

export const selectBalances = (state: RootState): BalancesState => {
  return state[balancesSlice.name]
}
