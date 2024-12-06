import { type Chain as ChainInfo } from '@/src/store/gateway/AUTO_GENERATED/chains'
import { GATEWAY_URL } from '@/src/config/constants'
import { createEntityAdapter, createSelector, EntityState } from '@reduxjs/toolkit'
import { RootState } from '../..'
import { cgwClient } from '@/src/store/gateway/cgwClient'
import { QueryReturnValue, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/dist/query'

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

  if (data.next) {
    return getChainsConfigs(data.next, nextResults)
  }

  return chainsAdapter.setAll(initialState, nextResults)
}

const getChains = async (): Promise<
  QueryReturnValue<EntityState<ChainInfo, string>, FetchBaseQueryError, FetchBaseQueryMeta>
> => {
  try {
    const data = await getChainsConfigs()
    return { data }
  } catch (error) {
    return { error: error as FetchBaseQueryError }
  }
}

export const apiSliceWithChainsConfig = cgwClient.injectEndpoints({
  endpoints: (builder) => ({
    getChainsConfig: builder.query<EntityState<ChainInfo, string>, void>({
      queryFn: async () => {
        return getChains()
      },
    }),
  }),
  overrideExisting: true,
})

const selectChainsResult = apiSliceWithChainsConfig.endpoints.getChainsConfig.select()

const selectChainsData = createSelector(selectChainsResult, (result) => {
  return result.data ?? initialState
})

const { selectAll: selectAllChains, selectById } = chainsAdapter.getSelectors(selectChainsData)

export const selectChainById = (state: RootState, chainId: string) => selectById(state, chainId)
export const { useGetChainsConfigQuery } = apiSliceWithChainsConfig
export { selectAllChains }
