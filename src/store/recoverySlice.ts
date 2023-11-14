import { createSelector } from '@reduxjs/toolkit'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'
import type { BigNumber } from 'ethers'

import { makeLoadableSlice } from './common'
import { sameAddress } from '@/utils/addresses'
import type { RootState } from '.'

export type RecoveryQueueItem = TransactionAddedEvent & {
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
  queue: Array<RecoveryQueueItem>
}>

const initialState: RecoveryState = []

const { slice, selector } = makeLoadableSlice('recovery', initialState)

export const recoverySlice = slice

const selectRecovery = createSelector(selector, (recovery) => recovery.data)

export const selectRecoveryByGuardian = createSelector(
  [selectRecovery, (_: RootState, walletAddress: string) => walletAddress],
  (recovery, walletAddress) => {
    return recovery.find(({ modules }) => modules.some((module) => sameAddress(module, walletAddress)))
  },
)
