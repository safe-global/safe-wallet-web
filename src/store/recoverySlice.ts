import { createSelector } from '@reduxjs/toolkit'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'

import { makeLoadableSlice } from './common'

export type RecoveryState = Array<{
  address: string
  modules: Array<string>
  txNonce: string
  transactionsAdded: Array<TransactionAddedEvent>
}>

const initialState: RecoveryState = []

const { slice, selector } = makeLoadableSlice('recovery', initialState)

export const recoverySlice = slice

// TODO: Multiple Delay Modifiers
export const selectRecovery = createSelector(selector, (recovery) => recovery.data[0])
export const selectRecoveryLoading = createSelector(selector, (recovery) => recovery.loading)
