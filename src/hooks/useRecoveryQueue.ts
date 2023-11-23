import { useContext } from 'react'

import { selectRecoveryQueues } from '@/services/recovery/selectors'
import { useClock } from './useClock'
import { RecoveryLoaderContext } from '@/components/recovery/RecoveryLoaderContext'
import type { RecoveryQueueItem } from '@/components/recovery/RecoveryLoaderContext'

export function useRecoveryQueue(): Array<RecoveryQueueItem> {
  const [data] = useContext(RecoveryLoaderContext).state
  const queue = data && selectRecoveryQueues(data)
  const clock = useClock()

  if (!queue) {
    return []
  }

  return queue.filter(({ expiresAt }) => {
    return expiresAt ? expiresAt.gt(clock) : true
  })
}
