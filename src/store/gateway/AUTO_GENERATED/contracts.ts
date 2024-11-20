import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['contracts'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1GetContract: build.query<V1GetContractApiResponse, V1GetContractApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/contracts/${queryArg.contractAddress}` }),
        providesTags: ['contracts'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1GetContractApiResponse = /** status 200  */ Contract
export type V1GetContractApiArg = {
  chainId: string
  contractAddress: string
}
export type Contract = {
  address: string
  name: string
  displayName: string
  logoUri: string
  contractAbi?: object | null
  trustedForDelegateCall: boolean
}
export const { useV1GetContractQuery } = injectedRtkApi
