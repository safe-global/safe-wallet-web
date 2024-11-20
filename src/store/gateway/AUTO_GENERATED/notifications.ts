import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['notifications'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1RegisterDevice: build.mutation<V1RegisterDeviceApiResponse, V1RegisterDeviceApiArg>({
        query: (queryArg) => ({ url: `/v1/register/notifications`, method: 'POST', body: queryArg.registerDeviceDto }),
        invalidatesTags: ['notifications'],
      }),
      v1UnregisterDevice: build.mutation<V1UnregisterDeviceApiResponse, V1UnregisterDeviceApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/notifications/devices/${queryArg.uuid}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['notifications'],
      }),
      v1UnregisterSafe: build.mutation<V1UnregisterSafeApiResponse, V1UnregisterSafeApiArg>({
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
export type V1RegisterDeviceApiResponse = unknown
export type V1RegisterDeviceApiArg = {
  registerDeviceDto: RegisterDeviceDto
}
export type V1UnregisterDeviceApiResponse = unknown
export type V1UnregisterDeviceApiArg = {
  chainId: string
  uuid: string
}
export type V1UnregisterSafeApiResponse = unknown
export type V1UnregisterSafeApiArg = {
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
export const { useV1RegisterDeviceMutation, useV1UnregisterDeviceMutation, useV1UnregisterSafeMutation } =
  injectedRtkApi
