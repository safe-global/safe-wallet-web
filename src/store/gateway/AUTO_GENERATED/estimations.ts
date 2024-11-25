import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['estimations'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      estimationsGetEstimationV2: build.mutation<
        EstimationsGetEstimationV2ApiResponse,
        EstimationsGetEstimationV2ApiArg
      >({
        query: (queryArg) => ({
          url: `/v2/chains/${queryArg.chainId}/safes/${queryArg.address}/multisig-transactions/estimations`,
          method: 'POST',
          body: queryArg.getEstimationDto,
        }),
        invalidatesTags: ['estimations'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type EstimationsGetEstimationV2ApiResponse = /** status 200  */ EstimationResponse
export type EstimationsGetEstimationV2ApiArg = {
  chainId: string
  address: string
  getEstimationDto: GetEstimationDto
}
export type EstimationResponse = {
  currentNonce: number
  recommendedNonce: number
  safeTxGas: string
}
export type GetEstimationDto = {
  to: string
  value: string
  data?: string | null
  operation: number
}
export const { useEstimationsGetEstimationV2Mutation } = injectedRtkApi
