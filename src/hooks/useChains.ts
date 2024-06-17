import { useMemo } from 'react'
import isEqual from 'lodash/isEqual'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import { selectChainById, selectChains } from '@/store/chainsSlice'
import { useChainId } from './useChainId'
import { type FEATURES, hasFeature } from '@/utils/chains'

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

export const useChain = (chainId: string): ChainInfo | undefined => {
  return useAppSelector((state) => selectChainById(state, chainId), isEqual)
}

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

/**
 * Checks if the balances provider (Zerion) is available on the current chain.
 * Currently used for getting ERC20 balances for undeployed safes.
 *
 * @returns `true`, if the feature is enabled on the current chain. Otherwise `false`
 */
export const useHasBalancesProvider = (): boolean => {
  const currentChain = useCurrentChain()
  return (
    !!currentChain &&
    (currentChain as ChainInfo & { balancesProvider: { chainName: string | null; enabled: boolean } }).balancesProvider
      .enabled
  )
}
