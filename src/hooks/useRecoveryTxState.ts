import { useContext } from 'react'

import { useClock } from './useClock'
import { selectDelayModifierByTxHash } from '@/services/recovery/selectors'
import { RecoveryLoaderContext } from '@/components/recovery/RecoveryLoaderContext'
import { sameAddress } from '@/utils/addresses'
import type { RecoveryQueueItem } from '@/components/recovery/RecoveryLoaderContext'

export function useRecoveryTxState({ validFrom, expiresAt, transactionHash, args, address }: RecoveryQueueItem): {
  isNext: boolean
  isExecutable: boolean
  isExpired: boolean
  remainingSeconds: number
} {
  const [data] = useContext(RecoveryLoaderContext).state
  const recovery = data && selectDelayModifierByTxHash(data, transactionHash)

  // We don't display seconds in the interface, so we can use a 60s interval
  const timestamp = useClock(60_000)
  const remainingMs = validFrom.sub(timestamp)

  const isValid = remainingMs.lte(0)
  const isExpired = expiresAt ? expiresAt.toNumber() <= Date.now() : false

  // Check module address in case multiple Delay Modifiers enabled
  const isNext = recovery ? sameAddress(recovery.address, address) && args.queueNonce.eq(recovery.txNonce) : false
  const isExecutable = isNext && isValid && !isExpired

  const remainingSeconds = isValid ? 0 : Math.ceil(remainingMs.div(1_000).toNumber())

  return { isNext, isExecutable, isExpired, remainingSeconds }
}
