import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['relay'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1Relay: build.mutation<V1RelayApiResponse, V1RelayApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/relay`, method: 'POST', body: queryArg.relayDto }),
        invalidatesTags: ['relay'],
      }),
      v1GetRelaysRemaining: build.query<V1GetRelaysRemainingApiResponse, V1GetRelaysRemainingApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/relay/${queryArg.safeAddress}` }),
        providesTags: ['relay'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1RelayApiResponse = unknown
export type V1RelayApiArg = {
  chainId: string
  relayDto: RelayDto
}
export type V1GetRelaysRemainingApiResponse = unknown
export type V1GetRelaysRemainingApiArg = {
  chainId: string
  safeAddress: string
}
export type RelayDto = {
  version: string
  to: string
  data: string
  /** If specified, a gas buffer of 150k will be added on top of the expected gas usage for the transaction.
          This is for the <a href="https://docs.gelato.network/developer-services/relay/quick-start/optional-parameters" target="_blank">
          Gelato Relay execution overhead</a>, reducing the chance of the task cancelling before it is executed on-chain. */
  gasLimit?: string | null
}
export const { useV1RelayMutation, useV1GetRelaysRemainingQuery } = injectedRtkApi
