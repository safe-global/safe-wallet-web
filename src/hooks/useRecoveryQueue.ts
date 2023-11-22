import { useAppSelector } from '@/store'
import { selectRecoveryQueues } from '@/store/recoverySlice'
import { useClock } from './useClock'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

export function useRecoveryQueue(): Array<RecoveryQueueItem> {
  const queue = useAppSelector(selectRecoveryQueues)
  const clock = useClock()

  return queue.filter(({ expiresAt }) => {
    return expiresAt ? expiresAt.gt(clock) : true
  })
}
