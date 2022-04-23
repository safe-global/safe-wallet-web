import { getFiatCurrencies, type FiatCurrencies } from '@gnosis.pm/safe-react-gateway-sdk'
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { logError, Errors } from '@/services/exceptions'
import { initialFetchState, LOADING_STATUS, type FetchState } from '@/store/fetchThunkState'
import type { RootState } from '@/store'

type CurrencyState = {
  currencies: FiatCurrencies
  selectedCurrency: string
} & FetchState

const initialState: CurrencyState = {
  currencies: [],
  selectedCurrency: 'usd',
  ...initialFetchState,
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
    builder.addCase(fetchCurrencies.pending, (state) => {
      state.status = LOADING_STATUS.PENDING
      state.error = undefined
    })
    builder.addCase(fetchCurrencies.fulfilled, (state, { payload }) => {
      state.status = LOADING_STATUS.SUCCEEDED
      state.currencies = payload
    })
    builder.addCase(fetchCurrencies.rejected, (state, { error, meta }) => {
      if (meta.aborted) {
        return
      }

      state.status = LOADING_STATUS.FAILED
      state.error = error

      logError(Errors._607, error.message)
    })
  },
})

export const { setCurrency } = currencySlice.actions

export const fetchCurrencies = createAsyncThunk(`${currencySlice.name}/fetchCurrencies`, async (_, { signal }) => {
  return await getFiatCurrencies(signal)
})

export const selectCurrency = (state: RootState): CurrencyState => {
  return state[currencySlice.name]
}
