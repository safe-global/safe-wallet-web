import type { BigNumber } from 'ethers'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import useWallet from '@/hooks/wallets/useWallet'
import { getProxyFactoryContractInstance } from '@/services/contracts/safeContracts'
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
  const proxyContractAddress = proxyContract.getAddress()

  const encodedSafeCreationTx = getSafeCreationTx({ owners, threshold, saltNonce, chain: currentChain })

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<BigNumber>(() => {
    if (!wallet?.address || !encodedSafeCreationTx || !web3ReadOnly) return

    return web3ReadOnly.estimateGas({
      to: proxyContractAddress,
      from: wallet.address,
      data: encodedSafeCreationTx,
    })
  }, [proxyContractAddress, wallet, encodedSafeCreationTx, web3ReadOnly])

  return { gasLimit, gasLimitError, gasLimitLoading }
}
