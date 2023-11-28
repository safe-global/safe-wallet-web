import { createContext, useContext } from 'react'
import type { ReactElement, ReactNode } from 'react'

import { useRecoveryState } from './useRecoveryState'
import { useRecoveryDelayModifiers } from './useRecoveryDelayModifiers'
import type { AsyncResult } from '@/hooks/useAsync'
import type { RecoveryState } from '@/services/recovery/recovery-state'
import { useRecoveryPendingTxs } from './useRecoveryPendingTxs'

// State of current Safe, populated on load
export const RecoveryContext = createContext<{
  state: AsyncResult<RecoveryState>
  pending: ReturnType<typeof useRecoveryPendingTxs>
}>({
  state: [undefined, undefined, false],
  pending: {},
})

export function RecoveryProvider({ children }: { children: ReactNode }): ReactElement {
  const [delayModifiers, delayModifiersError, delayModifiersLoading] = useRecoveryDelayModifiers()
  const [recoveryState, recoveryStateError, recoveryStateLoading] = useRecoveryState(delayModifiers)
  const pending = useRecoveryPendingTxs()

  const data = recoveryState
  const error = delayModifiersError || recoveryStateError
  const loading = delayModifiersLoading || recoveryStateLoading

  return (
    <RecoveryContext.Provider value={{ state: [data, error, loading], pending }}>{children}</RecoveryContext.Provider>
  )
}

export function useRecovery(): AsyncResult<RecoveryState> {
  return useContext(RecoveryContext).state
}
