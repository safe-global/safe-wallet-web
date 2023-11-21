import { useClock } from './useClock'
import { useAppSelector } from '@/store'
import { selectDelayModifierByTxHash } from '@/store/recoverySlice'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

// TODO: Test
export function useRecoveryTxState({ validFrom, expiresAt, transactionHash, args }: RecoveryQueueItem): {
  isNext: boolean
  isExecutable: boolean
  isExpired: boolean
  remainingSeconds: number
} {
  const recovery = useAppSelector((state) => selectDelayModifierByTxHash(state, transactionHash))

  // We don't display seconds in the interface, so we can use a 60s interval
  const timestamp = useClock(60_000)
  const remainingMs = validFrom.sub(timestamp)

  const isValid = remainingMs.lte(0)
  const isExpired = expiresAt ? expiresAt.toNumber() <= Date.now() : false
  const isNext = recovery ? args.queueNonce.eq(recovery.txNonce) : false
  const isExecutable = isNext && isValid && !isExpired

  const remainingSeconds = isValid ? 0 : Math.ceil(remainingMs.div(1_000).toNumber())

  return { isNext, isExecutable, isExpired, remainingSeconds }
}
