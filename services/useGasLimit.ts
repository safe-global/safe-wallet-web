import useAsync from '@/services/useAsync'
import { useWeb3ReadOnly } from '@/services/wallets/web3'

export type GasEstimationParams = {
  to: string
  from: string
  value?: string
  data: string
}

const useGasLimit = (
  txParams?: GasEstimationParams,
): {
  gasLimit?: number
  gasLimitError?: Error
  gasLimitLoading: boolean
} => {
  const web3ReadOnly = useWeb3ReadOnly()
  const { to, from, value, data } = txParams || {}

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<any>(async () => {
    if (!to || !web3ReadOnly) return undefined

    return await web3ReadOnly.estimateGas({ to, from, value, data })
  }, [to, from, value, data, web3ReadOnly])

  return { gasLimit, gasLimitError, gasLimitLoading }
}

export default useGasLimit
