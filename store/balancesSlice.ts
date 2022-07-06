import { type TokenInfo, type SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSelector } from '@reduxjs/toolkit'
import { makeLoadableSlice, makeSliceSelector } from './common'

export const balancesSlice = makeLoadableSlice<SafeBalanceResponse>('balances', {
  fiatTotal: '',
  items: [],
})
export const selectBalances = makeSliceSelector<SafeBalanceResponse>(balancesSlice)

export const selectTokens = createSelector(selectBalances, (balancesState): TokenInfo[] =>
  (balancesState.data?.items || []).map(({ tokenInfo }) => tokenInfo),
)
