import type { BigNumber } from 'ethers'
import { useWeb3 } from '@/hooks/wallets/web3'
import useWallet from '@/hooks/wallets/useWallet'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import { estimateSafeCreationGas, type SafeCreationProps } from '@/components/new-safe/create/logic'

export const useEstimateSafeCreationGas = (
  safeParams: SafeCreationProps,
): {
  gasLimit?: BigNumber
  gasLimitError?: Error
  gasLimitLoading: boolean
} => {
  const web3 = useWeb3()
  const chain = useCurrentChain()
  const wallet = useWallet()

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<BigNumber>(() => {
    if (!wallet?.address || !chain || !web3) return

    return estimateSafeCreationGas(chain, web3, wallet.address, safeParams)
  }, [wallet, chain, web3, safeParams])

  return { gasLimit, gasLimitError, gasLimitLoading }
}
