import { apiSliceWithChainsConfig, chainsAdapter, initialState } from '@safe-global/store/gateway/chains'
import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '..'

const selectChainsResult = apiSliceWithChainsConfig.endpoints.getChainsConfig.select()

const selectChainsData = createSelector(selectChainsResult, (result) => {
  return result.data ?? initialState
})

const { selectAll: selectAllChains, selectById } = chainsAdapter.getSelectors(selectChainsData)

export const selectChainById = (state: RootState, chainId: string) => selectById(state, chainId)
export const { useGetChainsConfigQuery } = apiSliceWithChainsConfig
export { selectAllChains }
