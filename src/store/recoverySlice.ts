import { createSelector } from '@reduxjs/toolkit'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'
import type { BigNumber } from 'ethers'

import { makeLoadableSlice } from './common'
import { sameAddress } from '@/utils/addresses'
import type { RootState } from '.'

export type RecoveryQueueItem = TransactionAddedEvent & {
  timestamp: BigNumber
  validFrom: BigNumber
  expiresAt: BigNumber | null
  isMalicious: boolean
  executor: string
}

// State of current Safe, populated on load
export type RecoveryState = Array<{
  address: string
  guardians: Array<string>
  txExpiration: BigNumber
  txCooldown: BigNumber
  txNonce: BigNumber
  queueNonce: BigNumber
  queue: Array<RecoveryQueueItem>
}>

const initialState: RecoveryState = []

const { slice, selector } = makeLoadableSlice('recovery', initialState)

export const recoverySlice = slice

export const selectRecovery = createSelector(selector, (recovery) => recovery.data)

export const selectDelayModifierByGuardian = createSelector(
  [selectRecovery, (_: RootState, walletAddress: string) => walletAddress],
  (recovery, walletAddress) => {
    return recovery.find(({ guardians }) => guardians.some((guardian) => sameAddress(guardian, walletAddress)))
  },
)

export const selectRecoveryQueues = createSelector(selectRecovery, (recovery) => {
  return recovery.flatMap(({ queue }) => queue).sort((a, b) => a.timestamp.sub(b.timestamp).toNumber())
})

export const selectDelayModifierByTxHash = createSelector(
  [selectRecovery, (_: RootState, txHash: string) => txHash],
  (recovery, txHash) => {
    return recovery.find(({ queue }) => queue.some((item) => item.transactionHash === txHash))
  },
)
