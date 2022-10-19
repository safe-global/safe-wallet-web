import { getGnosisSafeContractInstance } from '@/services/contracts/safeContracts'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import type { BigNumber } from 'ethers'

import useAsync from './useAsync'
import { useCurrentChain } from './useChains'
import useSafeInfo from './useSafeInfo'
import useWallet from './wallets/useWallet'
import { encodeSignatures } from '@/services/tx/encodeSignatures'

const useIsValidExecution = (
  safeTx?: SafeTransaction,
  gasLimit?: BigNumber,
): {
  isValidExecution?: boolean
  executionValidationError?: Error
  isValidExecutionLoading: boolean
} => {
  const wallet = useWallet()
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()

  const [isValidExecution, executionValidationError, isValidExecutionLoading] = useAsync(() => {
    if (!safeTx || !wallet?.address || !gasLimit || !chain) {
      return
    }

    const { contract } = getGnosisSafeContractInstance(chain, safe.version)

    return contract.callStatic
      .execTransaction(
        safeTx.data.to,
        safeTx.data.value,
        safeTx.data.data,
        safeTx.data.operation,
        safeTx.data.safeTxGas,
        safeTx.data.baseGas,
        safeTx.data.gasPrice,
        safeTx.data.gasToken,
        safeTx.data.refundReceiver,
        encodeSignatures(safeTx, wallet.address),
        { from: wallet.address, gasLimit: gasLimit.toString() },
      )
      .then(() => {
        return true
      })
  }, [safeTx, wallet?.address, gasLimit, chain])

  return { isValidExecution, executionValidationError, isValidExecutionLoading }
}

export default useIsValidExecution
