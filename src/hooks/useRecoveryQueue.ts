import { selectRecoveryQueues } from '@/services/recovery/selectors'
import { useClock } from './useClock'
import { useRecovery } from '@/components/recovery/RecoveryContext'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'

export function useRecoveryQueue(): Array<RecoveryQueueItem> {
  const [recovery] = useRecovery()
  const queue = recovery && selectRecoveryQueues(recovery)
  const clock = useClock()

  if (!queue) {
    return []
  }

  return queue.filter(({ expiresAt }) => {
    return expiresAt ? expiresAt.gt(clock) : true
  })
}
