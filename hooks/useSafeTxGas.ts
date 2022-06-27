import { type MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import { Operation, postSafeGasEstimation, type SafeTransactionEstimation } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync from './useAsync'
import { useChainId } from './useChainId'
import useSafeAddress from './useSafeAddress'

const estimateSafeTxGas = async (
  chainId: string,
  safeAddress: string,
  txParams: MetaTransactionData,
): Promise<SafeTransactionEstimation> => {
  return await postSafeGasEstimation(chainId, safeAddress, {
    to: txParams.to,
    value: txParams.value,
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

  const [safeGas, safeGasError, safeGasLoading] = useAsync<SafeTransactionEstimation | undefined>(async () => {
    if (!txParams) return
    return await estimateSafeTxGas(chainId, address, txParams)
  }, [chainId, address, txParams, txParams?.to, txParams?.data, txParams?.value, txParams?.operation])

  return { safeGas, safeGasError, safeGasLoading }
}

export default useSafeTxGas
