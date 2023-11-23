import { useCallback, useState } from 'react'
import type { Delay } from '@gnosis.pm/zodiac'

import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useIntervalCounter from '@/hooks/useIntervalCounter'
import { getRecoveryState } from '@/services/recovery/recovery-state'
import type { AsyncResult } from '@/hooks/useAsync'
import type { RecoveryState } from '.'

const REFRESH_DELAY = 5 * 60 * 1_000 // 5 minutes

export function useRecoveryState(delayModifiers?: Array<Delay>): {
  data: AsyncResult<RecoveryState>
  refetch: () => void
} {
  const web3ReadOnly = useWeb3ReadOnly()
  const chain = useCurrentChain()
  const { safe, safeAddress } = useSafeInfo()

  // Reload recovery data every REFRESH_DELAY
  const [counter] = useIntervalCounter(REFRESH_DELAY)

  // Reload recovery data when manually triggered
  const [refetchDep, setRefetchDep] = useState(false)
  const refetch = useCallback(() => {
    setRefetchDep((prev) => !prev)
  }, [])

  const data = useAsync<RecoveryState>(
    () => {
      if (delayModifiers && delayModifiers?.length > 0 && chain?.transactionService && web3ReadOnly) {
        return getRecoveryState({
          delayModifiers,
          transactionService: chain.transactionService,
          safeAddress,
          provider: web3ReadOnly,
          chainId: safe.chainId,
          version: safe.version,
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      delayModifiers,
      counter,
      refetchDep,
      chain?.transactionService,
      web3ReadOnly,
      safeAddress,
      safe.chainId,
      safe.version,
    ],
    false,
  )

  return { data, refetch }
}
