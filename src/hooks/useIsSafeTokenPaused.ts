import useChainId from '@/hooks/useChainId'
import { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useAsync from '@/hooks/useAsync'
import { Contract } from 'ethers'
import { Interface } from '@ethersproject/abi'

const PAUSED_ABI = 'function paused() public view virtual returns (bool)'

// TODO: Remove this hook after the safe token has been unpaused
const useIsSafeTokenPaused = () => {
  const chainId = useChainId()
  const provider = useWeb3ReadOnly()

  const [isSafeTokenPaused] = useAsync<boolean>(async () => {
    const safeTokenAddress = getSafeTokenAddress(chainId)

    const safeTokenContract = new Contract(safeTokenAddress, new Interface([PAUSED_ABI]), provider)

    let isPaused: boolean
    try {
      isPaused = await safeTokenContract.paused()
    } catch (err) {
      isPaused = false
    }

    return isPaused
  }, [chainId, provider])

  return isSafeTokenPaused
}

export default useIsSafeTokenPaused
