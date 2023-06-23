import type { BigNumber } from 'ethers'
import { useWeb3 } from '@/hooks/wallets/web3'
import { getSpendingLimitContract } from '@/services/contracts/spendingLimitContracts'
import useAsync from '@/hooks/useAsync'
import { type SpendingLimitTxParams } from '@/components/tx-flow/flows/TokenTransfer/ReviewSpendingLimitTx'
import useChainId from '@/hooks/useChainId'

const useSpendingLimitGas = (params: SpendingLimitTxParams) => {
  const chainId = useChainId()
  const provider = useWeb3()

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<BigNumber>(() => {
    if (!provider) return

    const contract = getSpendingLimitContract(chainId, provider.getSigner())

    return contract.estimateGas.executeAllowanceTransfer(
      params.safeAddress,
      params.token,
      params.to,
      params.amount,
      params.paymentToken,
      params.payment,
      params.delegate,
      params.signature,
    )
  }, [provider, chainId, params])

  return { gasLimit, gasLimitError, gasLimitLoading }
}

export default useSpendingLimitGas
