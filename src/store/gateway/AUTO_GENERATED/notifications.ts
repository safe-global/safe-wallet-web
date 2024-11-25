import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['notifications'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      notificationsRegisterDeviceV1: build.mutation<
        NotificationsRegisterDeviceV1ApiResponse,
        NotificationsRegisterDeviceV1ApiArg
      >({
        query: (queryArg) => ({ url: `/v1/register/notifications`, method: 'POST', body: queryArg.registerDeviceDto }),
        invalidatesTags: ['notifications'],
      }),
      notificationsUnregisterDeviceV1: build.mutation<
        NotificationsUnregisterDeviceV1ApiResponse,
        NotificationsUnregisterDeviceV1ApiArg
      >({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/notifications/devices/${queryArg.uuid}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['notifications'],
      }),
      notificationsUnregisterSafeV1: build.mutation<
        NotificationsUnregisterSafeV1ApiResponse,
        NotificationsUnregisterSafeV1ApiArg
      >({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/notifications/devices/${queryArg.uuid}/safes/${queryArg.safeAddress}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['notifications'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type NotificationsRegisterDeviceV1ApiResponse = unknown
export type NotificationsRegisterDeviceV1ApiArg = {
  registerDeviceDto: RegisterDeviceDto
}
export type NotificationsUnregisterDeviceV1ApiResponse = unknown
export type NotificationsUnregisterDeviceV1ApiArg = {
  chainId: string
  uuid: string
}
export type NotificationsUnregisterSafeV1ApiResponse = unknown
export type NotificationsUnregisterSafeV1ApiArg = {
  chainId: string
  uuid: string
  safeAddress: string
}
export type SafeRegistration = {
  chainId: string
  safes: string[]
  signatures: string[]
}
export type RegisterDeviceDto = {
  uuid?: string | null
  cloudMessagingToken: string
  buildNumber: string
  bundle: string
  deviceType: string
  version: string
  timestamp?: string | null
  safeRegistrations: SafeRegistration[]
}
export const {
  useNotificationsRegisterDeviceV1Mutation,
  useNotificationsUnregisterDeviceV1Mutation,
  useNotificationsUnregisterSafeV1Mutation,
} = injectedRtkApi
