import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import { selectChainById, selectChains } from '@/store/chainsSlice'
import { useChainId } from './useChainId'
import { getExplorerLink } from '@/utils/gateway'

const useChains = () => {
  const state = useAppSelector(selectChains)
  return {
    configs: state.data,
    error: state.error,
    loading: state.loading,
  }
}

export default useChains

export const useCurrentChain = ():
  | (ChainInfo & {
      getExplorerLink: (address: string) => { title: string; href: string }
    })
  | undefined => {
  const chainId = useChainId()
  const chainInfo = useAppSelector((state) => selectChainById(state, chainId))

  if (!chainInfo) return

  return {
    ...chainInfo,
    getExplorerLink: (address: string) => {
      return getExplorerLink(address, chainInfo.blockExplorerUriTemplate)
    },
  }
}
