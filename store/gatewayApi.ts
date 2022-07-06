import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  ChainListResponse,
  SafeBalanceResponse,
  SafeCollectibleResponse,
  SafeInfo,
  TransactionListPage,
} from '@gnosis.pm/safe-react-gateway-sdk'
import type { operations } from '@gnosis.pm/safe-react-gateway-sdk/dist/types/api'

import { GATEWAY_URL } from '@/config/constants'
import { logError, Errors } from '@/services/exceptions'

export const gatewayApi = createApi({
  reducerPath: 'gatewayApi',
  baseQuery: fetchBaseQuery({ baseUrl: GATEWAY_URL }),
  refetchOnFocus: true,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getBalances: builder.query<
      SafeBalanceResponse,
      {
        chainId: string
        address: string
        currency: string
        params?: operations['safes_balances_list']['parameters']['query']
      }
    >({
      query: ({ chainId, address, currency, params }) => ({
        url: `v1/chains/${chainId}/safes/${address}/balances/${currency}`,
        params,
      }),
      onQueryStarted: async (_, { queryFulfilled, extra }) => {
        await queryFulfilled.catch(({ error }) => logError(Errors._601, (error as Error).message))
      },
    }),

    getCollectibles: builder.query<
      SafeCollectibleResponse[],
      {
        chainId: string
        address: string
        params?: operations['safes_collectibles_list']['parameters']['query']
      }
    >({
      query: ({ chainId, address, params }) => ({
        url: `v1/chains/${chainId}/safes/${address}/collectibles`,
        params,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        await queryFulfilled.catch(({ error }) => logError(Errors._604, (error as Error).message))
      },
    }),

    getChains: builder.query<ChainListResponse, void>({
      query: () => ({
        url: 'v1/chains',
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        await queryFulfilled.catch(({ error }) => logError(Errors._904, (error as Error).message))
      },
    }),

    // Get Safe info and balance, then transactions and collectibles if necessary
    getSafeInfo: builder.query<SafeInfo, { chainId: string; address: string }>({
      query: ({ chainId, address }) => ({
        url: `v1/chains/${chainId}/safes/${address}`,
      }),
      onQueryStarted: async (params, { getCacheEntry, queryFulfilled, dispatch }) => {
        const { data } = getCacheEntry()

        const prevTxHistoryTag = data?.txHistoryTag
        const prevTxQueuedTag = data?.txQueuedTag
        const prevCollectiblesTag = data?.collectiblesTag

        await queryFulfilled
          .then(({ data }) => {
            const { txHistoryTag, txQueuedTag, collectiblesTag } = data
            const { getTxHistory, getTxQueue, getCollectibles } = gatewayApi.endpoints

            // Poll first page of history
            if (txHistoryTag !== prevTxHistoryTag) {
              dispatch(getTxHistory.initiate(params))
            }

            // Poll first page of queue
            if (txQueuedTag !== prevTxQueuedTag) {
              dispatch(getTxQueue.initiate(params))
            }

            // Get collectibles
            if (collectiblesTag !== prevCollectiblesTag) {
              dispatch(getCollectibles.initiate(params))
            }
          })
          .catch(({ error }) => logError(Errors._613, (error as Error).message))
      },
    }),

    getTxHistory: builder.query<TransactionListPage, { chainId: string; address: string; pageUrl?: string }>({
      query: ({ chainId, address, pageUrl }) => ({
        url: pageUrl ?? `v1/chains/${chainId}/safes/${address}/transactions/history`,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        await queryFulfilled.catch(({ error }) => logError(Errors._602, (error as Error).message))
      },
    }),

    getTxQueue: builder.query<TransactionListPage, { chainId: string; address: string; pageUrl?: string }>({
      query: ({ chainId, address, pageUrl }) => ({
        url: pageUrl ?? `v1/chains/${chainId}/safes/${address}/transactions/queued`,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        await queryFulfilled.catch(({ error }) => logError(Errors._603, (error as Error).message))
      },
    }),
  }),
})
