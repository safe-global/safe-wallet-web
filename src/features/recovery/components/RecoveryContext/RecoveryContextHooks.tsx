import { useEffect } from 'react'
import { useRecoveryState } from './useRecoveryState'
import { useRecoveryDelayModifiers } from './useRecoveryDelayModifiers'
import { useRecoveryPendingTxs } from './useRecoveryPendingTxs'
import { useRecoverySuccessEvents } from './useRecoverySuccessEvents'
import store from '.'

function RecoveryContextHooks(): null {
  const [delayModifiers, delayModifiersError, delayModifiersLoading] = useRecoveryDelayModifiers()
  const [recoveryState, recoveryStateError, recoveryStateLoading] = useRecoveryState(delayModifiers)
  const pending = useRecoveryPendingTxs()

  useRecoverySuccessEvents(pending, recoveryState)

  const data = recoveryState
  const error = delayModifiersError || recoveryStateError
  const loading = delayModifiersLoading || recoveryStateLoading

  useEffect(() => {
    store.setStore({
      state: [data, error, loading],
      pending,
    })
  }, [data, error, loading, pending])

  return null
}

export default RecoveryContextHooks
