import { getSpecificGnosisSafeContractInstance } from '@/services/contracts/safeContracts'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import type { BigNumber } from 'ethers'
import type { EthersError } from '@/utils/ethers-utils'

import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'
import useWallet from './wallets/useWallet'
import { encodeSignatures } from '@/services/tx/encodeSignatures'
import ContractErrorCodes from '@/services/contracts/ContractErrorCodes'
import { sameAddress } from '@/utils/addresses'

const isContractError = <T extends EthersError>(error: T): error is T & { reason: keyof typeof ContractErrorCodes } => {
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
  const wallet = useWallet()
  const { safe } = useSafeInfo()

  const [isValidExecution, executionValidationError, isValidExecutionLoading] = useAsync(async () => {
    if (!safeTx || !wallet?.address || !gasLimit) {
      return
    }

    const isSafeOwnerConnected = safe.owners.some((owner) => sameAddress(owner.value, wallet.address))

    const { contract } = getSpecificGnosisSafeContractInstance(safe)

    try {
      return await contract.callStatic.execTransaction(
        safeTx.data.to,
        safeTx.data.value,
        safeTx.data.data,
        safeTx.data.operation,
        safeTx.data.safeTxGas,
        safeTx.data.baseGas,
        safeTx.data.gasPrice,
        safeTx.data.gasToken,
        safeTx.data.refundReceiver,
        encodeSignatures(safeTx, isSafeOwnerConnected ? wallet.address : undefined),
        { from: wallet.address, gasLimit: gasLimit.toString() },
      )
    } catch (_err) {
      const err = _err as EthersError

      if (isContractError(err)) {
        // @ts-ignore
        err.reason += `: ${ContractErrorCodes[err.reason]}`
      }

      throw err
    }
  }, [safeTx, wallet?.address, gasLimit, safe])

  return { isValidExecution, executionValidationError, isValidExecutionLoading }
}

export default useIsValidExecution
