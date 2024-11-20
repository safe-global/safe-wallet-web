import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['messages'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1GetMessageByHash: build.query<V1GetMessageByHashApiResponse, V1GetMessageByHashApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/messages/${queryArg.messageHash}` }),
        providesTags: ['messages'],
      }),
      v1GetMessagesBySafe: build.query<V1GetMessagesBySafeApiResponse, V1GetMessagesBySafeApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/messages`,
          params: {
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['messages'],
      }),
      v1CreateMessage: build.mutation<V1CreateMessageApiResponse, V1CreateMessageApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/messages`,
          method: 'POST',
          body: queryArg.createMessageDto,
        }),
        invalidatesTags: ['messages'],
      }),
      v1UpdateMessageSignature: build.mutation<V1UpdateMessageSignatureApiResponse, V1UpdateMessageSignatureApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/messages/${queryArg.messageHash}/signatures`,
          method: 'POST',
          body: queryArg.updateMessageSignatureDto,
        }),
        invalidatesTags: ['messages'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1GetMessageByHashApiResponse = /** status 200  */ Message
export type V1GetMessageByHashApiArg = {
  chainId: string
  messageHash: string
}
export type V1GetMessagesBySafeApiResponse = /** status 200  */ MessagePage
export type V1GetMessagesBySafeApiArg = {
  chainId: string
  safeAddress: string
  cursor?: string
}
export type V1CreateMessageApiResponse = unknown
export type V1CreateMessageApiArg = {
  chainId: string
  safeAddress: string
  createMessageDto: CreateMessageDto
}
export type V1UpdateMessageSignatureApiResponse = unknown
export type V1UpdateMessageSignatureApiArg = {
  chainId: string
  messageHash: string
  updateMessageSignatureDto: UpdateMessageSignatureDto
}
export type AddressInfo = {
  value: string
  name?: string | null
  logoUri?: string | null
}
export type Message = {
  messageHash: string
  status: string
  logoUri?: string | null
  name?: string | null
  message: object
  creationTimestamp: number
  modifiedTimestamp: number
  confirmationsSubmitted: number
  confirmationsRequired: number
  proposedBy: AddressInfo
  confirmations: string[]
  preparedSignature?: string | null
  origin?: string | null
}
export type MessageItem = {
  messageHash: string
  status: string
  logoUri?: string | null
  name?: string | null
  message: object
  creationTimestamp: number
  modifiedTimestamp: number
  confirmationsSubmitted: number
  confirmationsRequired: number
  proposedBy: AddressInfo
  confirmations: string[]
  preparedSignature?: string | null
  origin?: string | null
  type: string
}
export type DateLabel = {
  type: 'DATE_LABEL'
  timestamp: number
}
export type MessagePage = {
  count?: number | null
  next?: string | null
  previous?: string | null
  results: (MessageItem | DateLabel)[]
}
export type CreateMessageDto = {
  message: object
  safeAppId?: number | null
  signature: string
  origin?: string | null
}
export type UpdateMessageSignatureDto = {
  signature: string
}
export const {
  useV1GetMessageByHashQuery,
  useV1GetMessagesBySafeQuery,
  useV1CreateMessageMutation,
  useV1UpdateMessageSignatureMutation,
} = injectedRtkApi
