import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['owners'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1GetSafesByOwner: build.query<V1GetSafesByOwnerApiResponse, V1GetSafesByOwnerApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/owners/${queryArg.ownerAddress}/safes` }),
        providesTags: ['owners'],
      }),
      v1GetAllSafesByOwner: build.query<V1GetAllSafesByOwnerApiResponse, V1GetAllSafesByOwnerApiArg>({
        query: (queryArg) => ({ url: `/v1/owners/${queryArg.ownerAddress}/safes` }),
        providesTags: ['owners'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1GetSafesByOwnerApiResponse = /** status 200  */ SafeList
export type V1GetSafesByOwnerApiArg = {
  chainId: string
  ownerAddress: string
}
export type V1GetAllSafesByOwnerApiResponse = /** status 200  */ SafeList
export type V1GetAllSafesByOwnerApiArg = {
  ownerAddress: string
}
export type SafeList = {
  safes: string[]
}
export const { useV1GetSafesByOwnerQuery, useV1GetAllSafesByOwnerQuery } = injectedRtkApi
