import { type SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { Loadable } from './common'

interface BalancesState extends Loadable {
  balances: SafeBalanceResponse
}

export const initialState: BalancesState = {
  loading: true,
  error: undefined,
  balances: {
    fiatTotal: '0',
    items: [],
  },
}

export const balancesSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: {
    setBalances: (_, action: PayloadAction<BalancesState>): BalancesState => {
      return action.payload
    },
  },
})

export const { setBalances } = balancesSlice.actions

export const selectBalances = (state: RootState): BalancesState => {
  return state[balancesSlice.name]
}
