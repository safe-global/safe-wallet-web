import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import { useSafeSDK } from './coreSDK/safeCoreSDK'
import useAsync from './useAsync'

const useIsValidExecution = (
  safeTx?: SafeTransaction,
): {
  isValidExecution?: boolean
  isValidExecutionError?: Error
  isValidExecutionLoading: boolean
} => {
  const safeSDK = useSafeSDK()

  const [isValidExecution, isValidExecutionError, isValidExecutionLoading] = useAsync(() => {
    if (!safeTx || !safeSDK) {
      return
    }

    return safeSDK
      .getContractManager()
      .safeContract.execTransaction(safeTx)
      .then(() => {
        return true
      })
  }, [safeTx, safeSDK])

  return { isValidExecution, isValidExecutionError, isValidExecutionLoading }
}

export default useIsValidExecution
