import useChainId from '@/hooks/useChainId'
import { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useAsync from '@/hooks/useAsync'
import { Contract } from 'ethers'
import { Interface } from '@ethersproject/abi'

// TODO: Remove this hook after the safe token has been unpaused
const useSafeTokenWarning = () => {
  const chainId = useChainId()
  const provider = useWeb3ReadOnly()

  const [isSafeTokenPaused] = useAsync<boolean>(async () => {
    const safeTokenAddress = getSafeTokenAddress(chainId)

    const safeTokenContract = new Contract(
      safeTokenAddress,
      new Interface(['function paused() public view virtual returns (bool)']),
      provider,
    )

    return safeTokenContract.paused()
  }, [chainId, provider])

  return {
    isSafeTokenPaused,
  }
}

export default useSafeTokenWarning
