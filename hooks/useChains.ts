import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import { selectChainById, selectChains } from '@/store/chainsSlice'
import { useChainId } from './useChainId'

const useChains = () => {
  const state = useAppSelector(selectChains)
  return {
    configs: state.data,
    error: state.error,
    loading: state.loading,
  }
}

export default useChains

export const useCurrentChain = (): ChainInfo | undefined => {
  const chainId = useChainId()
  return useAppSelector((state) => selectChainById(state, chainId))
}
