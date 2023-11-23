import { createContext, useContext, useEffect } from 'react'
import type { ReactElement, ReactNode } from 'react'

import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { sameAddress } from '@/utils/addresses'
import { getTxDetails } from '@/services/tx/txDetails'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useRecoveryState } from './useRecoveryState'
import { useRecoveryDelayModifiers } from './useRecoveryDelayModifiers'
import type { AsyncResult } from '@/hooks/useAsync'
import type { RecoveryState } from '@/services/recovery/recovery-state'

// State of current Safe, populated on load
export const RecoveryContext = createContext<{
  state: AsyncResult<RecoveryState>
  refetch: () => void
}>({
  state: [undefined, undefined, false],
  refetch: () => {},
})

export function RecoveryProvider({ children }: { children: ReactNode }): ReactElement {
  const { safe } = useSafeInfo()

  const [delayModifiers, delayModifiersError, delayModifiersLoading] = useRecoveryDelayModifiers()
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
    <RecoveryContext.Provider value={{ state: [data, error, loading], refetch }}>{children}</RecoveryContext.Provider>
  )
}

export function useRecovery(): AsyncResult<RecoveryState> {
  return useContext(RecoveryContext).state
}
