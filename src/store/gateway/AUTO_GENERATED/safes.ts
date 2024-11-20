import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['owners', 'safe-apps', 'safes'] as const
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
      v1GetSafeApps: build.query<V1GetSafeAppsApiResponse, V1GetSafeAppsApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/safe-apps`,
          params: {
            clientUrl: queryArg.clientUrl,
            url: queryArg.url,
          },
        }),
        providesTags: ['safe-apps'],
      }),
      v1GetSafe: build.query<V1GetSafeApiResponse, V1GetSafeApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}` }),
        providesTags: ['safes'],
      }),
      v1GetNonces: build.query<V1GetNoncesApiResponse, V1GetNoncesApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/nonces` }),
        providesTags: ['safes'],
      }),
      v1GetSafeOverview: build.query<V1GetSafeOverviewApiResponse, V1GetSafeOverviewApiArg>({
        query: (queryArg) => ({
          url: `/v1/safes`,
          params: {
            currency: queryArg.currency,
            safes: queryArg.safes,
            trusted: queryArg.trusted,
            exclude_spam: queryArg.excludeSpam,
            wallet_address: queryArg.walletAddress,
          },
        }),
        providesTags: ['safes'],
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
export type V1GetSafeAppsApiResponse = /** status 200  */ SafeApp[]
export type V1GetSafeAppsApiArg = {
  chainId: string
  clientUrl?: string
  url?: string
}
export type V1GetSafeApiResponse = /** status 200  */ SafeState
export type V1GetSafeApiArg = {
  chainId: string
  safeAddress: string
}
export type V1GetNoncesApiResponse = /** status 200  */ SafeNonces
export type V1GetNoncesApiArg = {
  chainId: string
  safeAddress: string
}
export type V1GetSafeOverviewApiResponse = unknown
export type V1GetSafeOverviewApiArg = {
  currency: string
  safes: string
  trusted?: boolean
  excludeSpam?: boolean
  walletAddress?: string
}
export type SafeList = {
  safes: string[]
}
export type SafeAppProvider = {
  url: string
  name: string
}
export type SafeAppAccessControl = {
  type: string
  value?: string[] | null
}
export type SafeAppSocialProfile = {
  platform: 'DISCORD' | 'GITHUB' | 'TWITTER' | 'UNKNOWN'
  url: string
}
export type SafeApp = {
  id: number
  url: string
  name: string
  iconUrl?: string | null
  description: string
  chainIds: string[]
  provider?: SafeAppProvider | null
  accessControl: SafeAppAccessControl
  tags: string[]
  features: string[]
  developerWebsite?: string | null
  socialProfiles: SafeAppSocialProfile[]
  featured: boolean
}
export type AddressInfo = {
  value: string
  name?: string | null
  logoUri?: string | null
}
export type SafeState = {
  address: AddressInfo
  chainId: string
  nonce: number
  threshold: number
  owners: string[]
  implementation: AddressInfo
  modules?: AddressInfo[] | null
  fallbackHandler?: AddressInfo | null
  guard?: AddressInfo | null
  version?: string | null
  implementationVersionState: 'UP_TO_DATE' | 'OUTDATED' | 'UNKNOWN'
  collectiblesTag?: string | null
  txQueuedTag?: string | null
  txHistoryTag?: string | null
  messagesTag?: string | null
}
export type SafeNonces = {
  currentNonce: number
  recommendedNonce: number
}
export const {
  useV1GetSafesByOwnerQuery,
  useV1GetSafeAppsQuery,
  useV1GetSafeQuery,
  useV1GetNoncesQuery,
  useV1GetSafeOverviewQuery,
} = injectedRtkApi
