import { useAppSelector } from '@/store'
import { selectHiddenTokensPerChain } from '@/store/settingsSlice'
import useChainId from './useChainId'

const useHiddenTokens = () => {
  const chainId = useChainId()
  return useAppSelector((state) => selectHiddenTokensPerChain(state, chainId))
}

export default useHiddenTokens
