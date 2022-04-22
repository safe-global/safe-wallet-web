import { type MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'

import useAsync from '@/services/useAsync'
import useSafeAddress from '@/services/useSafeAddress'
import { getWeb3ReadOnly } from '@/services/web3'

const useBaseGas = (
  txParams?: MetaTransactionData,
): {
  gasLimit?: number
  error?: Error
  loading: boolean
} => {
  const serializedParams = JSON.stringify(txParams)
  const { chainId } = useSafeAddress()

  const [gasLimit, error, loading] = useAsync<any>(async () => {
    if (!txParams || !chainId) return undefined

    const web3ReadOnly = getWeb3ReadOnly()
    return await web3ReadOnly.eth.estimateGas({
      to: txParams.to,
      value: txParams.value,
      data: txParams.data,
    })
  }, [serializedParams, chainId])

  return { gasLimit, error, loading }
}

export default useBaseGas
