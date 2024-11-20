import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['community'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1GetCampaigns: build.query<V1GetCampaignsApiResponse, V1GetCampaignsApiArg>({
        query: (queryArg) => ({
          url: `/v1/community/campaigns`,
          params: {
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['community'],
      }),
      v1GetCampaignById: build.query<V1GetCampaignByIdApiResponse, V1GetCampaignByIdApiArg>({
        query: (queryArg) => ({ url: `/v1/community/campaigns/${queryArg.resourceId}` }),
        providesTags: ['community'],
      }),
      v1GetCampaignActivities: build.query<V1GetCampaignActivitiesApiResponse, V1GetCampaignActivitiesApiArg>({
        query: (queryArg) => ({
          url: `/v1/community/campaigns/${queryArg.resourceId}/activities`,
          params: {
            holder: queryArg.holder,
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['community'],
      }),
      v1GetCampaignLeaderboard: build.query<V1GetCampaignLeaderboardApiResponse, V1GetCampaignLeaderboardApiArg>({
        query: (queryArg) => ({
          url: `/v1/community/campaigns/${queryArg.resourceId}/leaderboard`,
          params: {
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['community'],
      }),
      v1GetCampaignRank: build.query<V1GetCampaignRankApiResponse, V1GetCampaignRankApiArg>({
        query: (queryArg) => ({
          url: `/v1/community/campaigns/${queryArg.resourceId}/leaderboard/${queryArg.safeAddress}`,
        }),
        providesTags: ['community'],
      }),
      v1GetLeaderboard: build.query<V1GetLeaderboardApiResponse, V1GetLeaderboardApiArg>({
        query: (queryArg) => ({
          url: `/v1/community/locking/leaderboard`,
          params: {
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['community'],
      }),
      v1GetLockingRank: build.query<V1GetLockingRankApiResponse, V1GetLockingRankApiArg>({
        query: (queryArg) => ({ url: `/v1/community/locking/${queryArg.safeAddress}/rank` }),
        providesTags: ['community'],
      }),
      v1GetLockingHistory: build.query<V1GetLockingHistoryApiResponse, V1GetLockingHistoryApiArg>({
        query: (queryArg) => ({
          url: `/v1/community/locking/${queryArg.safeAddress}/history`,
          params: {
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['community'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1GetCampaignsApiResponse = /** status 200  */ CampaignPage
export type V1GetCampaignsApiArg = {
  cursor?: string
}
export type V1GetCampaignByIdApiResponse = /** status 200  */ Campaign
export type V1GetCampaignByIdApiArg = {
  resourceId: string
}
export type V1GetCampaignActivitiesApiResponse = unknown
export type V1GetCampaignActivitiesApiArg = {
  resourceId: string
  holder?: string
  cursor?: string
}
export type V1GetCampaignLeaderboardApiResponse = /** status 200  */ CampaignRankPage
export type V1GetCampaignLeaderboardApiArg = {
  resourceId: string
  cursor?: string
}
export type V1GetCampaignRankApiResponse = /** status 200  */ CampaignRank
export type V1GetCampaignRankApiArg = {
  resourceId: string
  safeAddress: string
}
export type V1GetLeaderboardApiResponse = /** status 200  */ LockingRankPage
export type V1GetLeaderboardApiArg = {
  cursor?: string
}
export type V1GetLockingRankApiResponse = /** status 200  */ LockingRank
export type V1GetLockingRankApiArg = {
  safeAddress: string
}
export type V1GetLockingHistoryApiResponse = /** status 200  */ LockingEventPage
export type V1GetLockingHistoryApiArg = {
  safeAddress: string
  cursor?: string
}
export type ActivityMetadata = {
  name: string
  description: string
  maxPoints: number
}
export type Campaign = {
  resourceId: string
  name: string
  description: string
  startDate: string
  endDate: string
  lastUpdated?: string | null
  activitiesMetadata?: ActivityMetadata[] | null
  rewardValue?: string | null
  rewardText?: string | null
  iconUrl?: string | null
  safeAppUrl?: string | null
  partnerUrl?: string | null
  isPromoted: boolean
}
export type CampaignPage = {
  count?: number | null
  next?: string | null
  previous?: string | null
  results: Campaign[]
}
export type CampaignRank = {
  holder: string
  position: number
  boost: number
  totalPoints: number
  totalBoostedPoints: number
}
export type CampaignRankPage = {
  count?: number | null
  next?: string | null
  previous?: string | null
  results: CampaignRank[]
}
export type LockingRank = {
  holder: string
  position: number
  lockedAmount: string
  unlockedAmount: string
  withdrawnAmount: string
}
export type LockingRankPage = {
  count?: number | null
  next?: string | null
  previous?: string | null
  results: LockingRank[]
}
export type LockEventItem = {
  eventType: 'LOCKED'
  executionDate: string
  transactionHash: string
  holder: string
  amount: string
  logIndex: string
}
export type UnlockEventItem = {
  eventType: 'UNLOCKED'
  executionDate: string
  transactionHash: string
  holder: string
  amount: string
  logIndex: string
  unlockIndex: string
}
export type WithdrawEventItem = {
  eventType: 'WITHDRAWN'
  executionDate: string
  transactionHash: string
  holder: string
  amount: string
  logIndex: string
  unlockIndex: string
}
export type LockingEventPage = {
  count?: number | null
  next?: string | null
  previous?: string | null
  results: (LockEventItem | UnlockEventItem | WithdrawEventItem)[]
}
export const {
  useV1GetCampaignsQuery,
  useV1GetCampaignByIdQuery,
  useV1GetCampaignActivitiesQuery,
  useV1GetCampaignLeaderboardQuery,
  useV1GetCampaignRankQuery,
  useV1GetLeaderboardQuery,
  useV1GetLockingRankQuery,
  useV1GetLockingHistoryQuery,
} = injectedRtkApi
