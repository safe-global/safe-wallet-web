import type { BigNumber } from 'ethers'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useWallet from '@/hooks/wallets/useWallet'
import { getProxyFactoryContractInstance } from '@/services/contracts/safeContracts'
import useAsync from '@/hooks/useAsync'
import { getSafeCreationTx } from '@/components/create-safe/sender'
import { useCurrentChain } from '@/hooks/useChains'

export type SafeCreationProps = {
  owners: string[]
  threshold: number
  saltNonce: number
}

export const useEstimateSafeCreationGas = ({
  owners,
  threshold,
  saltNonce,
}: SafeCreationProps): {
  gasLimit?: BigNumber
  gasLimitError?: Error
  gasLimitLoading: boolean
} => {
  const web3ReadOnly = useWeb3ReadOnly()
  const chain = useCurrentChain()
  const wallet = useWallet()

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<BigNumber>(() => {
    if (!wallet?.address || !chain || !web3ReadOnly) return

    const proxyFactoryContract = getProxyFactoryContractInstance(chain.chainId)
    const encodedSafeCreationTx = getSafeCreationTx({ owners, threshold, saltNonce, chain })

    return web3ReadOnly.estimateGas({
      to: proxyFactoryContract.getAddress(),
      from: wallet.address,
      data: encodedSafeCreationTx,
    })
  }, [wallet, chain, web3ReadOnly])

  return { gasLimit, gasLimitError, gasLimitLoading }
}
