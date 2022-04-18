import { type SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

type BalancesState = SafeBalanceResponse

const initialState: BalancesState = {
  fiatTotal: '0',
  items: [],
}

export const balancesSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: {
    setBalances: (_, action: PayloadAction<SafeBalanceResponse | undefined>): BalancesState => {
      return action.payload || initialState
    },
  },
})

export const { setBalances } = balancesSlice.actions

export const selectBalances = (state: RootState): BalancesState => {
  return state[balancesSlice.name]
}
