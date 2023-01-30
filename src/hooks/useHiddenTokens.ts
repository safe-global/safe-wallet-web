import { useAppSelector } from '@/store'
import { selectHiddenTokensPerChain } from '@/store/settingsSlice'
import { ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import useChainId from './useChainId'

const useHiddenTokens = () => {
  const chainId = useChainId()
  // In the initial release it was possible to hide the native token (ZERO ADDRESS). We do not want this to be possible anymore,
  // thus we filter out the ZERO address from hidden tokens
  return useAppSelector((state) => selectHiddenTokensPerChain(state, chainId)).filter((token) => token !== ZERO_ADDRESS)
}

export default useHiddenTokens
