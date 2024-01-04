import { selectRecoveryQueues } from '@/features/recovery/services/selectors'
import useRecovery from '@/features/recovery/hooks/useRecovery'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'

export function useRecoveryQueue(): Array<RecoveryQueueItem> {
  const [recovery] = useRecovery()
  const queue = recovery && selectRecoveryQueues(recovery)
  return queue ?? []
}
