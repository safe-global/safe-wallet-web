import { useContext } from 'react'

import { useClock } from '../../../hooks/useClock'
import { selectDelayModifierByTxHash } from '@/features/recovery/services/selectors'
import { RecoveryContext } from '@/features/recovery/components/RecoveryContext'
import { sameAddress } from '@/utils/addresses'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'

export function useRecoveryTxState({ validFrom, expiresAt, transactionHash, args, address }: RecoveryQueueItem): {
  isNext: boolean
  isExecutable: boolean
  isExpired: boolean
  isPending: boolean
  remainingSeconds: number
} {
  const {
    state: [recovery],
    pending,
  } = useContext(RecoveryContext)
  const delayModifier = recovery && selectDelayModifierByTxHash(recovery, transactionHash)

  // We don't display seconds in the interface, so we can use a 60s interval
  const timestamp = useClock(60_000)
  const remainingMs = validFrom.sub(timestamp)

  const isValid = remainingMs.lte(0)
  const isExpired = expiresAt ? expiresAt.toNumber() <= Date.now() : false

  // Check module address in case multiple Delay Modifiers enabled
  const isNext =
    !delayModifier || (sameAddress(delayModifier.address, address) && args.queueNonce.eq(delayModifier.txNonce))
  const isExecutable = isNext && isValid && !isExpired
  const isPending = !!pending?.[args.txHash]

  const remainingSeconds = isValid ? 0 : Math.ceil(remainingMs.div(1_000).toNumber())

  return { isNext, isExecutable, isExpired, remainingSeconds, isPending }
}
