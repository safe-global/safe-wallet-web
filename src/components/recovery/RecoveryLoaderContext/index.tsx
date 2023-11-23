import { createContext, useEffect } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'
import type { BigNumber } from 'ethers'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { sameAddress } from '@/utils/addresses'
import { getTxDetails } from '@/services/tx/txDetails'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useRecoveryState } from './useRecoveryState'
import { useDelayModifiers } from './useDelayModifiers'
import type { AsyncResult } from '@/hooks/useAsync'

export type RecoveryQueueItem = TransactionAddedEvent & {
  timestamp: BigNumber
  validFrom: BigNumber
  expiresAt: BigNumber | null
  isMalicious: boolean
  executor: string
}

export type RecoveryStateItem = {
  address: string
  guardians: Array<string>
  txExpiration: BigNumber
  txCooldown: BigNumber
  txNonce: BigNumber
  queueNonce: BigNumber
  queue: Array<RecoveryQueueItem>
}

export type RecoveryState = Array<RecoveryStateItem>

// State of current Safe, populated on load
export const RecoveryLoaderContext = createContext<{
  state: AsyncResult<RecoveryState>
  refetch: () => void
}>({
  state: [undefined, undefined, false],
  refetch: () => {},
})

export function RecoveryLoaderProvider({ children }: { children: ReactNode }): ReactElement {
  const { safe } = useSafeInfo()

  const [delayModifiers, delayModifiersError, delayModifiersLoading] = useDelayModifiers()
  const {
    data: [recoveryState, recoveryStateError, recoveryStateLoading],
    refetch,
  } = useRecoveryState(delayModifiers)

  // Reload recovery data when a Delay Modifier is interacted with
  useEffect(() => {
    if (!delayModifiers || delayModifiers.length === 0) {
      return
    }

    return txSubscribe(TxEvent.PROCESSED, async (detail) => {
      if (!detail.txId) {
        return
      }

      const { txData } = await getTxDetails(detail.txId, safe.chainId)

      if (!txData) {
        return
      }

      const isDelayModifierTx = delayModifiers.some((delayModifier) => {
        return sameAddress(delayModifier.address, txData.to.value)
      })

      if (isDelayModifierTx) {
        refetch()
      }
    })
  }, [safe.chainId, delayModifiers, refetch])

  const data = recoveryState
  const error = delayModifiersError || recoveryStateError
  const loading = delayModifiersLoading || recoveryStateLoading

  return (
    <RecoveryLoaderContext.Provider value={{ state: [data, error, loading], refetch }}>
      {children}
    </RecoveryLoaderContext.Provider>
  )
}
