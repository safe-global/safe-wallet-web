import useWallet from '@/hooks/wallets/useWallet'
import type { BigNumber } from 'ethers'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getSpendingLimitContract, getSpendingLimitInterface } from '@/services/contracts/spendingLimitContracts'
import useAsync from '@/hooks/useAsync'
import { type SpendingLimitTxParams } from '@/components/tx-flow/flows/TokenTransfer/ReviewSpendingLimitTx'
import useChainId from '@/hooks/useChainId'

const useSpendingLimitGas = (params: SpendingLimitTxParams) => {
  const chainId = useChainId()
  const provider = useWeb3ReadOnly()
  const wallet = useWallet()

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<BigNumber>(() => {
    if (!provider || !wallet) return

    const contract = getSpendingLimitContract(chainId, provider)
    const spendingLimitInterface = getSpendingLimitInterface()

    const data = spendingLimitInterface.encodeFunctionData('executeAllowanceTransfer', [
      params.safeAddress,
      params.token,
      params.to,
      params.amount,
      params.paymentToken,
      params.payment,
      params.delegate,
      params.signature,
    ])

    return provider.estimateGas({
      to: contract.address,
      from: wallet.address,
      data: data,
    })
  }, [provider, wallet, chainId, params])

  return { gasLimit, gasLimitError, gasLimitLoading }
}

export default useSpendingLimitGas
