import { useEffect, useState } from 'react'

import { RecoveryEvent, recoverySubscribe } from '@/services/recovery/recoveryEvents'

export type PendingRecoveryTransactions = { [recoveryTxHash: string]: RecoveryEvent }

const pendingStatuses: { [key in RecoveryEvent]: RecoveryEvent | null } = {
  [RecoveryEvent.PROCESSING_BY_SMART_CONTRACT_WALLET]: null,
  [RecoveryEvent.PROCESSING]: RecoveryEvent.PROCESSING,
  [RecoveryEvent.PROCESSED]: RecoveryEvent.PROCESSED,
  [RecoveryEvent.REVERTED]: null,
  [RecoveryEvent.FAILED]: null,
}

export function useRecoveryPendingTxs(): PendingRecoveryTransactions {
  const [pending, setPending] = useState<PendingRecoveryTransactions>({})

  useEffect(() => {
    const unsubFns = Object.entries(pendingStatuses).map(([event, status]) =>
      recoverySubscribe(event as RecoveryEvent, (detail) => {
        const recoveryTxHash = 'recoveryTxHash' in detail && detail.recoveryTxHash

        if (!recoveryTxHash) {
          return
        }

        setPending((prev) => {
          if (status === null) {
            const { [recoveryTxHash]: _, ...rest } = prev
            return rest
          }

          return { ...prev, [recoveryTxHash]: status }
        })
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [])

  return pending
}
