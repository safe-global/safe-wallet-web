import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['targeted-messaging'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1GetSubmission: build.query<V1GetSubmissionApiResponse, V1GetSubmissionApiArg>({
        query: (queryArg) => ({
          url: `/v1/targeted-messaging/outreaches/${queryArg.outreachId}/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/signers/${queryArg.signerAddress}/submissions`,
        }),
        providesTags: ['targeted-messaging'],
      }),
      v1CreateSubmission: build.mutation<V1CreateSubmissionApiResponse, V1CreateSubmissionApiArg>({
        query: (queryArg) => ({
          url: `/v1/targeted-messaging/outreaches/${queryArg.outreachId}/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/signers/${queryArg.signerAddress}/submissions`,
          method: 'POST',
          body: queryArg.createSubmissionDto,
        }),
        invalidatesTags: ['targeted-messaging'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1GetSubmissionApiResponse = /** status 200  */ Submission
export type V1GetSubmissionApiArg = {
  outreachId: number
  chainId: string
  safeAddress: string
  signerAddress: string
}
export type V1CreateSubmissionApiResponse = /** status 201  */ Submission
export type V1CreateSubmissionApiArg = {
  outreachId: number
  chainId: string
  safeAddress: string
  signerAddress: string
  createSubmissionDto: CreateSubmissionDto
}
export type Submission = {
  outreachId: number
  targetedSafeId: number
  signerAddress: string
  completionDate?: string | null
}
export type CreateSubmissionDto = {
  completed: boolean
}
export const { useV1GetSubmissionQuery, useV1CreateSubmissionMutation } = injectedRtkApi
