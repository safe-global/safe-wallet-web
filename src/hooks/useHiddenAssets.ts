import { useAppSelector } from '@/store'
import { selectHiddenAssetsPerChain } from '@/store/hiddenAssetsSlice'
import useChainId from './useChainId'

const useHiddenAssets = () => {
  const chainId = useChainId()
  return useAppSelector((state) => selectHiddenAssetsPerChain(state, chainId))
}

export default useHiddenAssets
