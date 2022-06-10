import type { MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'

import useAsync from '@/services/useAsync'
import { useWeb3ReadOnly } from '@/services/wallets/Web3Provider'

const useGasLimit = (
  txParams?: MetaTransactionData,
): {
  gasLimit?: number
  gasLimitError?: Error
  gasLimitLoading: boolean
} => {
  const serializedParams = JSON.stringify(txParams)
  const web3ReadOnly = useWeb3ReadOnly()

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<any>(async () => {
    if (!txParams || !web3ReadOnly) return undefined

    return await web3ReadOnly.estimateGas({
      to: txParams.to,
      value: txParams.value,
      data: txParams.data,
    })
  }, [serializedParams, web3ReadOnly])

  return { gasLimit, gasLimitError, gasLimitLoading }
}

export default useGasLimit
