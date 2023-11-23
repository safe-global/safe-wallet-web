import { createSelector } from '@reduxjs/toolkit'

import type { RecoveryState } from '@/components/recovery/RecoveryLoaderContext'
import { sameAddress } from '@/utils/addresses'

// Identity function to help with type inference
function selectRecovery<T extends RecoveryState | undefined>(state: T): T {
  return state
}

export const selectDelayModifierByGuardian = createSelector(
  [selectRecovery, (_: RecoveryState, walletAddress: string) => walletAddress],
  (recovery, walletAddress) => {
    return recovery?.find(({ guardians }) => guardians.some((guardian) => sameAddress(guardian, walletAddress)))
  },
)

export const selectRecoveryQueues = createSelector([selectRecovery], (recovery) => {
  return recovery?.flatMap(({ queue }) => queue).sort((a, b) => a.timestamp.sub(b.timestamp).toNumber())
})

export const selectDelayModifierByTxHash = createSelector(
  [selectRecovery, (_: RecoveryState, txHash: string) => txHash],
  (recovery, txHash) => {
    return recovery?.find(({ queue }) => queue.some((item) => item.transactionHash === txHash))
  },
)

export const selectDelayModifierByAddress = createSelector(
  [selectRecovery, (_: RecoveryState, moduleAddress: string) => moduleAddress],
  (recovery, moduleAddress) => {
    return recovery?.find(({ address }) => sameAddress(address, moduleAddress))
  },
)
