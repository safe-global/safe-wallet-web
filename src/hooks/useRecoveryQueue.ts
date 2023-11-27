import { selectRecoveryQueues } from '@/services/recovery/selectors'
import { useRecovery } from '@/components/recovery/RecoveryContext'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'

export function useRecoveryQueue(): Array<RecoveryQueueItem> {
  const [recovery] = useRecovery()
  const queue = recovery && selectRecoveryQueues(recovery)

  return queue ?? []
}
