import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['data-decoded'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1GetDataDecoded: build.mutation<V1GetDataDecodedApiResponse, V1GetDataDecodedApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/data-decoder`,
          method: 'POST',
          body: queryArg.transactionDataDto,
        }),
        invalidatesTags: ['data-decoded'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1GetDataDecodedApiResponse = /** status 200  */ DataDecoded
export type V1GetDataDecodedApiArg = {
  chainId: string
  transactionDataDto: TransactionDataDto
}
export type DataDecodedParameter = {
  name: string
  type: string
  value: object
  valueDecoded?: ((object | null) | (object[] | null)) | null
}
export type DataDecoded = {
  method: string
  parameters?: DataDecodedParameter[] | null
}
export type TransactionDataDto = {
  /** Hexadecimal value */
  data: string
  /** The target Ethereum address */
  to?: string
  /** The wei amount being sent to a payable function */
  value?: string
}
export const { useV1GetDataDecodedMutation } = injectedRtkApi
