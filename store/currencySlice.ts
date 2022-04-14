import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'

type CurrencysState = string

const initialState: CurrencysState = 'usd'

export const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (_, action: PayloadAction<CurrencysState>): CurrencysState => {
      return action.payload
    },
  },
})

export const { setCurrency } = currencySlice.actions

export const selectCurrency = (state: RootState): CurrencysState => {
  return state[currencySlice.name]
}
