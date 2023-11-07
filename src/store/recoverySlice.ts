import { createSelector } from '@reduxjs/toolkit'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'

import { makeLoadableSlice } from './common'

export type RecoveryState = Array<{
  address: string
  modules: Array<string>
  txCooldown: string
  txNonce: string
  queueNonce: string
  transactionsAdded: Array<TransactionAddedEvent>
}>

const initialState: RecoveryState = []

const { slice, selector } = makeLoadableSlice('recovery', initialState)

export const recoverySlice = slice

export const selectRecovery = createSelector(selector, (recovery) => recovery.data)
