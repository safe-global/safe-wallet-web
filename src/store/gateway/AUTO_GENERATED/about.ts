import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['about'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getAbout: build.query<GetAboutApiResponse, GetAboutApiArg>({
        query: () => ({ url: `/about` }),
        providesTags: ['about'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type GetAboutApiResponse = /** status 200  */ About
export type GetAboutApiArg = void
export type About = {
  name: string
  version?: string | null
  buildNumber?: string | null
}
export const { useGetAboutQuery } = injectedRtkApi
