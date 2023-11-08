import { createSelector } from '@reduxjs/toolkit'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'
import type { BigNumber } from 'ethers'

import { makeLoadableSlice } from './common'

type QueuedTransactionAdded = TransactionAddedEvent & {
  timestamp: number
  validFrom: BigNumber
  expiresAt: BigNumber | null
}

export type RecoveryState = Array<{
  address: string
  modules: Array<string>
  txExpiration: BigNumber
  txCooldown: BigNumber
  txNonce: BigNumber
  queueNonce: BigNumber
  queue: Array<QueuedTransactionAdded>
}>

const initialState: RecoveryState = []

const { slice, selector } = makeLoadableSlice('recovery', initialState)

export const recoverySlice = slice

export const selectRecovery = createSelector(selector, (recovery) => recovery.data)
