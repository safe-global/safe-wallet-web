import { type MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'

import useAsync from '@/services/useAsync'
import { getWeb3ReadOnly } from '@/services/wallets/web3'

const useBaseGas = (
  txParams?: MetaTransactionData,
): {
  gasLimit?: number
  error?: Error
  loading: boolean
} => {
  const serializedParams = JSON.stringify(txParams)
  const web3ReadOnly = getWeb3ReadOnly()

  const [gasLimit, error, loading] = useAsync<any>(async () => {
    if (!txParams || !web3ReadOnly) return undefined

    return await web3ReadOnly.eth.estimateGas({
      to: txParams.to,
      value: txParams.value,
      data: txParams.data,
    })
  }, [serializedParams, web3ReadOnly])

  return { gasLimit, error, loading }
}

export default useBaseGas
