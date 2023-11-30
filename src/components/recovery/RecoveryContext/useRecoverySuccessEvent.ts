import { useEffect } from 'react'

import { recoveryDispatch, RecoveryEvent } from '@/services/recovery/recoveryEvents'
import type { PendingRecoveryTransactions } from './useRecoveryPendingTxs'
import type { RecoveryState } from '@/services/recovery/recovery-state'

function dispatchSuccessEvent(pending: PendingRecoveryTransactions, recovery: RecoveryState) {
  for (const delayModifier of Object.values(recovery)) {
    for (const item of delayModifier.queue) {
      if (!(item.args.txHash in pending)) {
        continue
      }

      recoveryDispatch(RecoveryEvent.SUCCESS, {
        moduleAddress: delayModifier.address,
        txHash: item.transactionHash,
        recoveryTxHash: item.args.txHash,
      })
    }
  }
}

export function useRecoverySuccessEvent(pending: PendingRecoveryTransactions, recovery?: RecoveryState): void {
  useEffect(() => {
    if (recovery && recovery.length > 0 && Object.keys(pending).length > 0) {
      dispatchSuccessEvent(pending, recovery)
    }
  }, [recovery, pending])
}
