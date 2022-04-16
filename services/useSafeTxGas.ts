import { type MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import { Operation, postSafeGasEstimation, type SafeTransactionEstimation } from '@gnosis.pm/safe-react-gateway-sdk'
import { GATEWAY_URL } from 'config/constants'
import useAsync from './useAsync'
import useSafeAddress from './useSafeAddress'

const estimateGas = async (
  chainId: string,
  safeAddress: string,
  txParams: MetaTransactionData,
): Promise<SafeTransactionEstimation> => {
  return await postSafeGasEstimation(GATEWAY_URL, chainId, safeAddress, {
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
  error?: Error
  loading: boolean
} => {
  const { address, chainId } = useSafeAddress()
  const serializedParams = JSON.stringify(txParams)

  const [safeGas, error, loading] = useAsync<SafeTransactionEstimation | undefined>(async () => {
    return txParams ? await estimateGas(chainId, address, txParams) : undefined
  }, [chainId, address, serializedParams])

  return { safeGas, error, loading }
}

export default useSafeTxGas
