import { estimateSafeCreationGas, type SafeCreationProps } from '@/components/new-safe/create/logic'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'

export const useEstimateSafeCreationGas = (
  safeParams: SafeCreationProps,
): {
  gasLimit?: bigint
  gasLimitError?: Error
  gasLimitLoading: boolean
} => {
  const web3ReadOnly = useWeb3ReadOnly()
  const chain = useCurrentChain()
  const wallet = useWallet()

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<bigint>(() => {
    if (!wallet?.address || !chain || !web3ReadOnly) return

    return estimateSafeCreationGas(chain, web3ReadOnly, wallet.address, safeParams)
  }, [wallet, chain, web3ReadOnly, safeParams])

  return { gasLimit, gasLimitError, gasLimitLoading }
}
