import { useAppSelector } from '@/store'
import { selectChainById, selectChains } from '@/store/chainsSlice'
import { hasFeature, type FEATURES } from '@/utils/chains'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import isEqual from 'lodash/isEqual'
import { useMemo } from 'react'
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

/**
 * Checks if a feature is enabled on the current chain.
 *
 * @param feature name of the feature to check for
 * @returns `true`, if the feature is enabled on the current chain. Otherwise `false`
 */
export const useHasFeature = (feature: FEATURES): boolean => {
  const currentChain = useCurrentChain()
  return !!currentChain && hasFeature(currentChain, feature)
}
