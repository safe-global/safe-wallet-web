import { useMemo } from 'react'
import isEqual from 'lodash/isEqual'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import { selectChainById, selectChains } from '@/store/chainsSlice'
import { useChainId } from './useChainId'

const useChains = (): { configs: ChainInfo[]; error?: string; loading?: boolean } => {
  const state = useAppSelector(selectChains, isEqual)

  return useMemo(
    () => ({
      configs: state.data,
      error: state.error,
      loading: state.loading,
    }),
    [state.data, state.error, state.loading],
  )
}

export default useChains

export const useCurrentChain = (): ChainInfo | undefined => {
  const chainId = useChainId()
  const chainInfo = useAppSelector((state) => selectChainById(state, chainId), isEqual)
  return chainInfo
}
