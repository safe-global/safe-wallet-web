import { getBalances, type SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { logError, Errors } from '@/services/exceptions'
import { selectCurrency } from '@/store/currencySlice'
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
      if (isRaceCondition(state, action)) return
      // Reset balance when fetching as it's a new Safe
      Object.assign(state, initialState, getPendingState(action))
    })
    builder.addCase(fetchBalances.fulfilled, (state, action) => {
      if (isRaceCondition(state, action)) return
      Object.assign(state, getFulfilledState(action), action.payload)
    })
    builder.addCase(fetchBalances.rejected, (state, action) => {
      if (isRaceCondition(state, action)) return
      Object.assign(state, getRejectedState(action))

      logError(Errors._601, action.error.message)
    })
  },
})

export const fetchBalances = createAsyncThunk<
  SafeBalanceResponse,
  { chainId: string; address: string },
  { state: RootState }
>(`${balancesSlice.name}/fetchBalances`, async ({ chainId, address }, { getState }) => {
  const { selectedCurrency } = selectCurrency(getState())
  return await getBalances(chainId, address, selectedCurrency)
})

export const selectBalances = (state: RootState): BalancesState => {
  return state[balancesSlice.name]
}
