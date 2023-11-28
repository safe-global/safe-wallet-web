import { createContext, useContext, useState } from 'react'
import type { ReactElement, ReactNode, Dispatch, SetStateAction } from 'react'

import { useRecoveryState } from './useRecoveryState'
import { useRecoveryDelayModifiers } from './useRecoveryDelayModifiers'
import type { AsyncResult } from '@/hooks/useAsync'
import type { RecoveryState } from '@/services/recovery/recovery-state'

type PendingRecoveryTransactions = { [txHash: string]: boolean }

// State of current Safe, populated on load
export const RecoveryContext = createContext<{
  state: AsyncResult<RecoveryState>
  refetch: () => void
  pending: PendingRecoveryTransactions
  setPending: Dispatch<SetStateAction<PendingRecoveryTransactions>>
}>({
  state: [undefined, undefined, false],
  refetch: () => {},
  pending: {},
  setPending: () => {},
})

export function RecoveryProvider({ children }: { children: ReactNode }): ReactElement {
  const [delayModifiers, delayModifiersError, delayModifiersLoading] = useRecoveryDelayModifiers()
  const {
    data: [recoveryState, recoveryStateError, recoveryStateLoading],
    refetch,
  } = useRecoveryState(delayModifiers)
  const [pending, setPending] = useState<PendingRecoveryTransactions>({})

  const data = recoveryState
  const error = delayModifiersError || recoveryStateError
  const loading = delayModifiersLoading || recoveryStateLoading

  return (
    <RecoveryContext.Provider value={{ state: [data, error, loading], refetch, pending, setPending }}>
      {children}
    </RecoveryContext.Provider>
  )
}

export function useRecovery(): AsyncResult<RecoveryState> {
  return useContext(RecoveryContext).state
}
