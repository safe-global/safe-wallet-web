import { createSelector } from '@reduxjs/toolkit'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'

import { makeLoadableSlice } from './common'

type QueuedTransactionAdded = TransactionAddedEvent & {
  timestamp: number
  validFrom: string
  expiresAt: string | null
}

export type RecoveryState = Array<{
  address: string
  modules: Array<string>
  txExpiration: string
  txCooldown: string
  txNonce: string
  queueNonce: string
  queue: Array<QueuedTransactionAdded>
}>

const initialState: RecoveryState = []

const { slice, selector } = makeLoadableSlice('recovery', initialState)

export const recoverySlice = slice

export const selectRecovery = createSelector(selector, (recovery) => recovery.data)
