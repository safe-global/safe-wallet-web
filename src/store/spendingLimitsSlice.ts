import { createSelector } from '@reduxjs/toolkit'
import { makeLoadableSlice } from './common'

export type SpendingLimitState = {
  beneficiary: string
  token: {
    address: string
    symbol: string
    decimals: number
    logoUri?: string
  }
  amount: string
  nonce: string
  resetTimeMin: string
  lastResetMin: string
  spent: string
}

const initialState: SpendingLimitState[] = []

const { slice, selector } = makeLoadableSlice('spendingLimits', initialState)

export const spendingLimitSlice = slice

export const selectSpendingLimits = createSelector(selector, (spendingLimits) => {
  return spendingLimits.data
})
