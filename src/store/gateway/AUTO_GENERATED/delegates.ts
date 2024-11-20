import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['delegates'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v2GetDelegates: build.query<V2GetDelegatesApiResponse, V2GetDelegatesApiArg>({
        query: (queryArg) => ({
          url: `/v2/chains/${queryArg.chainId}/delegates`,
          params: {
            safe: queryArg.safe,
            delegate: queryArg.delegate,
            delegator: queryArg.delegator,
            label: queryArg.label,
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['delegates'],
      }),
      v2PostDelegate: build.mutation<V2PostDelegateApiResponse, V2PostDelegateApiArg>({
        query: (queryArg) => ({
          url: `/v2/chains/${queryArg.chainId}/delegates`,
          method: 'POST',
          body: queryArg.createDelegateDto,
        }),
        invalidatesTags: ['delegates'],
      }),
      v2DeleteDelegate: build.mutation<V2DeleteDelegateApiResponse, V2DeleteDelegateApiArg>({
        query: (queryArg) => ({
          url: `/v2/chains/${queryArg.chainId}/delegates/${queryArg.delegateAddress}`,
          method: 'DELETE',
          body: queryArg.deleteDelegateV2Dto,
        }),
        invalidatesTags: ['delegates'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V2GetDelegatesApiResponse = /** status 200  */ DelegatePage
export type V2GetDelegatesApiArg = {
  chainId: string
  safe?: string
  delegate?: string
  delegator?: string
  label?: string
  cursor?: string
}
export type V2PostDelegateApiResponse = unknown
export type V2PostDelegateApiArg = {
  chainId: string
  createDelegateDto: CreateDelegateDto
}
export type V2DeleteDelegateApiResponse = unknown
export type V2DeleteDelegateApiArg = {
  chainId: string
  delegateAddress: string
  deleteDelegateV2Dto: DeleteDelegateV2Dto
}
export type Delegate = {
  safe?: string | null
  delegate: string
  delegator: string
  label: string
}
export type DelegatePage = {
  count?: number | null
  next?: string | null
  previous?: string | null
  results: Delegate[]
}
export type CreateDelegateDto = {
  safe?: string | null
  delegate: string
  delegator: string
  signature: string
  label: string
}
export type DeleteDelegateV2Dto = {
  delegator?: string | null
  safe?: string | null
  signature: string
}
export const { useV2GetDelegatesQuery, useV2PostDelegateMutation, useV2DeleteDelegateMutation } = injectedRtkApi
