import { useEffect } from 'react'

import { RecoveryEvent, RecoveryTxType, recoveryDispatch } from '@/services/recovery/recoveryEvents'
import type { RecoveryState } from '@/services/recovery/recovery-state'
import type { useRecoveryPendingTxs } from './useRecoveryPendingTxs'

export function useRecoverySuccessEvents(
  pending: ReturnType<typeof useRecoveryPendingTxs>,
  recoveryState?: RecoveryState,
): void {
  useEffect(() => {
    const pendingEntries = Object.entries(pending)

    if (!recoveryState || recoveryState.length === 0 || pendingEntries.length === 0) {
      return
    }

    pendingEntries.forEach(([recoveryTxHash, { txType, status }]) => {
      // Transaction successfully executed, waiting for recovery state to be loaded again
      if (status !== RecoveryEvent.PROCESSED) {
        return
      }

      const isQueued = recoveryState.some(({ queue }) => queue.some(({ args }) => args.txHash === recoveryTxHash))

      if (isQueued) {
        // Only proposals should appear in the queue
        if (txType === RecoveryTxType.PROPOSAL) {
          recoveryDispatch(RecoveryEvent.SUCCESS, {
            recoveryTxHash,
            txType,
          })
        }
      } else {
        // Executions/cancellations are removed from the queue
        recoveryDispatch(RecoveryEvent.SUCCESS, {
          recoveryTxHash,
          txType,
        })
      }
    })
  }, [pending, recoveryState])
}
