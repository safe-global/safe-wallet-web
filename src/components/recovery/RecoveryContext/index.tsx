import { createContext, useContext } from 'react'
import type { ReactElement, ReactNode } from 'react'

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
  const [delayModifiers, delayModifiersError, delayModifiersLoading] = useRecoveryDelayModifiers()
  const {
    data: [recoveryState, recoveryStateError, recoveryStateLoading],
    refetch,
  } = useRecoveryState(delayModifiers)

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
