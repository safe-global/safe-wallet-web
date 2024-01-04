import store, { type RecoveryContextType } from '../components/RecoveryContext'

function useRecovery(): RecoveryContextType['state'] {
  return store.useStore()?.state || [undefined, undefined, false]
}

export default useRecovery
