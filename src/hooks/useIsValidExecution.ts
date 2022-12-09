import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { BigNumber } from 'ethers'
import type { EthersError } from '@/utils/ethers-utils'

import useAsync from './useAsync'
import ContractErrorCodes from '@/services/contracts/ContractErrorCodes'
import { useSafeSDK } from './coreSDK/safeCoreSDK'

const isContractError = (error: EthersError) => {
  if (!error.reason) return false

  return Object.keys(ContractErrorCodes).includes(error.reason)
}

const useIsValidExecution = (
  safeTx?: SafeTransaction,
  gasLimit?: BigNumber,
): {
  isValidExecution?: boolean
  executionValidationError?: Error
  isValidExecutionLoading: boolean
} => {
  const safeSdk = useSafeSDK()

  const [isValidExecution, executionValidationError, isValidExecutionLoading] = useAsync(async () => {
    if (!safeTx || !safeSdk || !gasLimit) {
      return
    }
    try {
      return await safeSdk.isValidTransaction(safeTx, { gasLimit: gasLimit.toString() })
    } catch (_err) {
      const err = _err as EthersError

      if (isContractError(err)) {
        // @ts-ignore
        err.reason += `: ${ContractErrorCodes[err.reason]}`
      }

      throw err
    }
  }, [safeTx, safeSdk, gasLimit])

  return { isValidExecution, executionValidationError, isValidExecutionLoading }
}

export default useIsValidExecution
