import { type MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import { Operation, postSafeGasEstimation, type SafeTransactionEstimation } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync from './useAsync'
import { useChainId } from './useChainId'
import useSafeAddress from './useSafeAddress'

const estimateGas = async (
  chainId: string,
  safeAddress: string,
  txParams: MetaTransactionData,
): Promise<SafeTransactionEstimation> => {
  return await postSafeGasEstimation(chainId, safeAddress, {
    to: txParams.to,
    value: parseInt(txParams.value, 16).toString(),
    data: txParams.data,
    operation: (txParams.operation as unknown as Operation) || Operation.CALL,
  })
}

const useSafeTxGas = (
  txParams?: MetaTransactionData,
): {
  safeGas?: SafeTransactionEstimation
  safeGasError?: Error
  safeGasLoading: boolean
} => {
  const address = useSafeAddress()
  const chainId = useChainId()
  const serializedParams = JSON.stringify(txParams)

  const [safeGas, safeGasError, safeGasLoading] = useAsync<SafeTransactionEstimation | undefined>(async () => {
    return txParams ? await estimateGas(chainId, address, txParams) : undefined
  }, [chainId, address, serializedParams])

  return { safeGas, safeGasError, safeGasLoading }
}

export default useSafeTxGas
