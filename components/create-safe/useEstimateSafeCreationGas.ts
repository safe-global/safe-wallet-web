import { BigNumber } from 'ethers'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import useWallet from '@/hooks/wallets/useWallet'
import { getProxyFactoryContractInstance } from '@/services/safeContracts'
import useAsync from '@/hooks/useAsync'
import { getSafeCreationTx } from '@/components/create-safe/sender'

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
  const chainId = useChainId()
  const currentChain = useAppSelector((state) => selectChainById(state, chainId))
  const wallet = useWallet()

  const proxyContract = getProxyFactoryContractInstance(chainId)
  const encodedSafeCreationTx = getSafeCreationTx({ owners, threshold, saltNonce, chain: currentChain })

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<BigNumber | undefined>(async () => {
    if (!wallet?.address || !encodedSafeCreationTx || !web3ReadOnly) return

    return web3ReadOnly.estimateGas({
      to: proxyContract.address,
      from: wallet.address,
      data: encodedSafeCreationTx,
    })
  }, [proxyContract.address, wallet, encodedSafeCreationTx, web3ReadOnly])

  return { gasLimit, gasLimitError, gasLimitLoading }
}
