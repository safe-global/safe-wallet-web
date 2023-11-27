import { createContext, useContext, useEffect } from 'react'
import { addListener } from '@reduxjs/toolkit'
import type { ReactElement, ReactNode } from 'react'

import { useAppDispatch } from '@/store'
import { sameAddress } from '@/utils/addresses'
import { isCustomTxInfo, isMultiSendTxInfo, isTransactionListItem } from '@/utils/transaction-guards'
import { txHistorySlice } from '@/store/txHistorySlice'
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
  const dispatch = useAppDispatch()

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

    // Listen to history polls (only occuring when the txHistoryTag changes)
    const listener = dispatch(
      addListener({
        actionCreator: txHistorySlice.actions.set,
        effect: (action) => {
          // Get the most recent transaction
          const [latestTx] = action.payload.data?.results.filter(isTransactionListItem) ?? []

          if (!latestTx) {
            return
          }

          const { txInfo } = latestTx.transaction

          const isDelayModiferTx = delayModifiers.some((delayModifier) => {
            return isCustomTxInfo(txInfo) && sameAddress(txInfo.to.value, delayModifier.address)
          })

          // Refetch if the most recent transaction was with a Delay Modifier or MultiSend
          // (Multiple Delay Modifier settings changes are batched into a MultiSend)
          if (isDelayModiferTx || isMultiSendTxInfo(txInfo)) {
            refetch()
          }
        },
      }),
    )

    // Types are incorrect, but this ensures type safety
    const unsubscribe =
      listener instanceof Function
        ? (listener as unknown as typeof listener.payload.unsubscribe)
        : listener.payload.unsubscribe

    return unsubscribe
  }, [safe.chainId, delayModifiers, refetch, dispatch])

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
