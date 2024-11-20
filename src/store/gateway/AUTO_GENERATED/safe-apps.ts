import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['safe-apps'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
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
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1GetSafeAppsApiResponse = /** status 200  */ SafeApp[]
export type V1GetSafeAppsApiArg = {
  chainId: string
  clientUrl?: string
  url?: string
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
export const { useV1GetSafeAppsQuery } = injectedRtkApi
