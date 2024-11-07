import { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { buildQueryFn } from '../utils'
import { GATEWAY_URL } from '@/src/config/constants'
import { createEntityAdapter, createSelector, EntityState } from '@reduxjs/toolkit'
import { gatewayApi } from '..'
import { RootState } from '../..'

const chainsAdapter = createEntityAdapter<ChainInfo, string>({ selectId: (chain: ChainInfo) => chain.chainId })
const initialState = chainsAdapter.getInitialState()

const getChainsConfigs = async (
  url = `${GATEWAY_URL}/v1/chains`,
  results: ChainInfo[] = [],
): Promise<EntityState<ChainInfo, string>> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()

  const nextResults = [...results, ...data.results]

  if (data.next) return getChainsConfigs(url, nextResults)

  return chainsAdapter.setAll(initialState, nextResults)
}

const getChains = () => {
  return buildQueryFn(getChainsConfigs)
}

export const apiSliceWithChainsConfig = gatewayApi.injectEndpoints({
  endpoints: (builder) => ({
    getChainsConfig: builder.query({
      queryFn: getChains,
    }),
  }),
})

const selectChainsResult = apiSliceWithChainsConfig.endpoints.getChainsConfig.select({})

const selectChainsData = createSelector(selectChainsResult, (result) => {
  return result.data ?? initialState
})

const { selectAll, selectById } = chainsAdapter.getSelectors(selectChainsData)

export const selectChainById = (state: RootState, chainId: string) => selectById(state, chainId)
export const { useGetChainsConfigQuery } = apiSliceWithChainsConfig
export { selectAll }
