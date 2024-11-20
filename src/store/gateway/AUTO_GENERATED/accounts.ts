import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['accounts'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1CreateAccount: build.mutation<V1CreateAccountApiResponse, V1CreateAccountApiArg>({
        query: (queryArg) => ({ url: `/v1/accounts`, method: 'POST', body: queryArg.createAccountDto }),
        invalidatesTags: ['accounts'],
      }),
      v1GetDataTypes: build.query<V1GetDataTypesApiResponse, V1GetDataTypesApiArg>({
        query: () => ({ url: `/v1/accounts/data-types` }),
        providesTags: ['accounts'],
      }),
      v1GetAccountDataSettings: build.query<V1GetAccountDataSettingsApiResponse, V1GetAccountDataSettingsApiArg>({
        query: (queryArg) => ({ url: `/v1/accounts/${queryArg.address}/data-settings` }),
        providesTags: ['accounts'],
      }),
      v1UpsertAccountDataSettings: build.mutation<
        V1UpsertAccountDataSettingsApiResponse,
        V1UpsertAccountDataSettingsApiArg
      >({
        query: (queryArg) => ({
          url: `/v1/accounts/${queryArg.address}/data-settings`,
          method: 'PUT',
          body: queryArg.upsertAccountDataSettingsDto,
        }),
        invalidatesTags: ['accounts'],
      }),
      v1GetAccount: build.query<V1GetAccountApiResponse, V1GetAccountApiArg>({
        query: (queryArg) => ({ url: `/v1/accounts/${queryArg.address}` }),
        providesTags: ['accounts'],
      }),
      v1DeleteAccount: build.mutation<V1DeleteAccountApiResponse, V1DeleteAccountApiArg>({
        query: (queryArg) => ({ url: `/v1/accounts/${queryArg.address}`, method: 'DELETE' }),
        invalidatesTags: ['accounts'],
      }),
      v1GetCounterfactualSafe: build.query<V1GetCounterfactualSafeApiResponse, V1GetCounterfactualSafeApiArg>({
        query: (queryArg) => ({
          url: `/v1/accounts/${queryArg.address}/counterfactual-safes/${queryArg.chainId}/${queryArg.predictedAddress}`,
        }),
        providesTags: ['accounts'],
      }),
      v1DeleteCounterfactualSafe: build.mutation<
        V1DeleteCounterfactualSafeApiResponse,
        V1DeleteCounterfactualSafeApiArg
      >({
        query: (queryArg) => ({
          url: `/v1/accounts/${queryArg.address}/counterfactual-safes/${queryArg.chainId}/${queryArg.predictedAddress}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['accounts'],
      }),
      v1GetCounterfactualSafes: build.query<V1GetCounterfactualSafesApiResponse, V1GetCounterfactualSafesApiArg>({
        query: (queryArg) => ({ url: `/v1/accounts/${queryArg.address}/counterfactual-safes` }),
        providesTags: ['accounts'],
      }),
      v1CreateCounterfactualSafe: build.mutation<
        V1CreateCounterfactualSafeApiResponse,
        V1CreateCounterfactualSafeApiArg
      >({
        query: (queryArg) => ({
          url: `/v1/accounts/${queryArg.address}/counterfactual-safes`,
          method: 'PUT',
          body: queryArg.createCounterfactualSafeDto,
        }),
        invalidatesTags: ['accounts'],
      }),
      v1DeleteCounterfactualSafes: build.mutation<
        V1DeleteCounterfactualSafesApiResponse,
        V1DeleteCounterfactualSafesApiArg
      >({
        query: (queryArg) => ({ url: `/v1/accounts/${queryArg.address}/counterfactual-safes`, method: 'DELETE' }),
        invalidatesTags: ['accounts'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1CreateAccountApiResponse = /** status 200  */ Account
export type V1CreateAccountApiArg = {
  createAccountDto: CreateAccountDto
}
export type V1GetDataTypesApiResponse = /** status 200  */ AccountDataType[]
export type V1GetDataTypesApiArg = void
export type V1GetAccountDataSettingsApiResponse = /** status 200  */ AccountDataSetting[]
export type V1GetAccountDataSettingsApiArg = {
  address: string
}
export type V1UpsertAccountDataSettingsApiResponse = /** status 200  */ AccountDataSetting[]
export type V1UpsertAccountDataSettingsApiArg = {
  address: string
  upsertAccountDataSettingsDto: UpsertAccountDataSettingsDto
}
export type V1GetAccountApiResponse = /** status 200  */ Account
export type V1GetAccountApiArg = {
  address: string
}
export type V1DeleteAccountApiResponse = unknown
export type V1DeleteAccountApiArg = {
  address: string
}
export type V1GetCounterfactualSafeApiResponse = /** status 200  */ CounterfactualSafe
export type V1GetCounterfactualSafeApiArg = {
  address: string
  chainId: string
  predictedAddress: string
}
export type V1DeleteCounterfactualSafeApiResponse = unknown
export type V1DeleteCounterfactualSafeApiArg = {
  address: string
  chainId: string
  predictedAddress: string
}
export type V1GetCounterfactualSafesApiResponse = /** status 200  */ CounterfactualSafe[]
export type V1GetCounterfactualSafesApiArg = {
  address: string
}
export type V1CreateCounterfactualSafeApiResponse = /** status 200  */ CounterfactualSafe
export type V1CreateCounterfactualSafeApiArg = {
  address: string
  createCounterfactualSafeDto: CreateCounterfactualSafeDto
}
export type V1DeleteCounterfactualSafesApiResponse = unknown
export type V1DeleteCounterfactualSafesApiArg = {
  address: string
}
export type Account = {
  id: string
  groupId?: string | null
  address: string
  name: string
}
export type CreateAccountDto = {
  address: string
  name: string
}
export type AccountDataType = {
  id: string
  name: string
  description?: string | null
  isActive: boolean
}
export type AccountDataSetting = {
  dataTypeId: string
  enabled: boolean
}
export type UpsertAccountDataSettingDto = {
  dataTypeId: string
  enabled: boolean
}
export type UpsertAccountDataSettingsDto = {
  accountDataSettings: UpsertAccountDataSettingDto[]
}
export type CounterfactualSafe = {
  chainId: string
  creator: string
  fallbackHandler: string
  owners: string[]
  predictedAddress: string
  saltNonce: string
  singletonAddress: string
  threshold: number
}
export type CreateCounterfactualSafeDto = {
  chainId: string
  fallbackHandler: string
  owners: string[]
  predictedAddress: string
  saltNonce: string
  singletonAddress: string
  threshold: number
}
export const {
  useV1CreateAccountMutation,
  useV1GetDataTypesQuery,
  useV1GetAccountDataSettingsQuery,
  useV1UpsertAccountDataSettingsMutation,
  useV1GetAccountQuery,
  useV1DeleteAccountMutation,
  useV1GetCounterfactualSafeQuery,
  useV1DeleteCounterfactualSafeMutation,
  useV1GetCounterfactualSafesQuery,
  useV1CreateCounterfactualSafeMutation,
  useV1DeleteCounterfactualSafesMutation,
} = injectedRtkApi
