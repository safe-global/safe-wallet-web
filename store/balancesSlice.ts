import { type TokenInfo, type SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSelector } from '@reduxjs/toolkit'
import { makeLoadableSlice } from './common'

const { slice, selector } = makeLoadableSlice('balances', {
  items: [],
  fiatTotal: '',
} as SafeBalanceResponse)

export const balancesSlice = slice
export const selectBalances = selector

export const selectTokens = createSelector(selectBalances, (balancesState): TokenInfo[] =>
  balancesState.data.items.map(({ tokenInfo }) => tokenInfo),
)
