import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['auth', 'safes'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1GetNonce: build.query<V1GetNonceApiResponse, V1GetNonceApiArg>({
        query: () => ({ url: `/v1/auth/nonce` }),
        providesTags: ['auth'],
      }),
      v1Verify: build.mutation<V1VerifyApiResponse, V1VerifyApiArg>({
        query: (queryArg) => ({ url: `/v1/auth/verify`, method: 'POST', body: queryArg.siweDto }),
        invalidatesTags: ['auth'],
      }),
      v1GetNonces: build.query<V1GetNoncesApiResponse, V1GetNoncesApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/nonces` }),
        providesTags: ['safes'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1GetNonceApiResponse = /** status 200  */ AuthNonce
export type V1GetNonceApiArg = void
export type V1VerifyApiResponse = unknown
export type V1VerifyApiArg = {
  siweDto: SiweDto
}
export type V1GetNoncesApiResponse = /** status 200  */ SafeNonces
export type V1GetNoncesApiArg = {
  chainId: string
  safeAddress: string
}
export type AuthNonce = {
  nonce: string
}
export type SiweDto = {
  message: string
  signature: string
}
export type SafeNonces = {
  currentNonce: number
  recommendedNonce: number
}
export const { useV1GetNonceQuery, useV1VerifyMutation, useV1GetNoncesQuery } = injectedRtkApi
