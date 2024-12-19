import { cgwDebugStorage } from '@/components/sidebar/DebugToggle'
import { IS_PRODUCTION, GATEWAY_URL_PRODUCTION, GATEWAY_URL_STAGING } from '@/config/constants'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// TODO: Replace this with the auto-generated SDK once available.
const GATEWAY_URL = IS_PRODUCTION || cgwDebugStorage.get() ? GATEWAY_URL_PRODUCTION : GATEWAY_URL_STAGING
const GLOBAL_CAMPAIGN_IDS: Record<'1' | '11155111', string> = {
  '11155111': 'fa9f462b-8e8c-4122-aa41-2464e919b721',
  '1': '9ed78b8b-178d-4e25-9ef2-1517865991ee',
}

export type CampaignLeaderboardEntry = {
  holder: string
  position: number
  boost: string
  totalPoints: number
  totalBoostedPoints: number
}

export const safePassApi = createApi({
  reducerPath: 'safePassApi',
  baseQuery: fetchBaseQuery({ baseUrl: GATEWAY_URL }),
  endpoints: (builder) => ({
    getOwnGlobalCampaignRank: builder.query<
      CampaignLeaderboardEntry,
      { chainId: '1' | '11155111'; safeAddress: string }
    >({
      query: (request) => ({
        url: `v1/community/campaigns/${GLOBAL_CAMPAIGN_IDS[request.chainId]}/leaderboard/${request.safeAddress}`,
      }),
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetOwnGlobalCampaignRankQuery } = safePassApi
