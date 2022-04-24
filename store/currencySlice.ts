import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getFiatCurrencies, type FiatCurrencies } from '@gnosis.pm/safe-react-gateway-sdk'

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

type CurrencyState = {
  currencies: FiatCurrencies
  selectedCurrency: string
} & ThunkState

const DEFAULT_CURRENCY = 'usd'

const initialState: CurrencyState = {
  currencies: [DEFAULT_CURRENCY],
  selectedCurrency: DEFAULT_CURRENCY,
  ...initialThunkState,
}

export const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, { payload }: PayloadAction<CurrencyState['currencies'][number]>) => {
      state.selectedCurrency = payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrencies.pending, (state, action) => {
      Object.assign(state, getPendingState(action))
    })
    builder.addCase(fetchCurrencies.fulfilled, (state, action) => {
      if (isRaceCondition(state, action)) return
      Object.assign(state, getFulfilledState(action), { currencies: action.payload })
    })
    builder.addCase(fetchCurrencies.rejected, (state, action) => {
      if (isRaceCondition(state, action)) return
      Object.assign(state, getRejectedState(action))

      logError(Errors._607, action.error.message)
    })
  },
})

export const { setCurrency } = currencySlice.actions

export const fetchCurrencies = createAsyncThunk<FiatCurrencies>(`${currencySlice.name}/fetchCurrencies`, async () => {
  return await getFiatCurrencies()
})

export const selectCurrency = (state: RootState): CurrencyState => {
  return state[currencySlice.name]
}
