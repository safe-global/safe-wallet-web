import { type MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import { getWeb3ReadOnly } from '@/services/web3'
import useAsync from './useAsync'

const useBaseGas = (
  txParams?: MetaTransactionData,
): {
  gasLimit?: number
  error?: Error
  loading: boolean
} => {
  const serializedParams = JSON.stringify(txParams)

  const [gasLimit, error, loading] = useAsync<any>(async () => {
    if (!txParams) return undefined

    const web3 = getWeb3ReadOnly()

    return await web3.eth.estimateGas({
      to: txParams.to,
      value: txParams.value,
      data: txParams.data,
    })
  }, [serializedParams])

  return { gasLimit, error, loading }
}

export default useBaseGas
