import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

import { getTransactionDetails, type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { asError } from '@/services/exceptions/utils'
import { getDelegates } from '@safe-global/safe-gateway-typescript-sdk'
import type { DelegateResponse } from '@safe-global/safe-gateway-typescript-sdk/dist/types/delegates'
import { safeOverviewEndpoints } from './safeOverviews'

async function buildQueryFn<T>(fn: () => Promise<T>) {
  try {
    return { data: await fn() }
  } catch (error) {
    return { error: asError(error) }
  }
}

export const gatewayApi = createApi({
  reducerPath: 'gatewayApi',
  baseQuery: fakeBaseQuery<Error>(),
  endpoints: (builder) => ({
    getTransactionDetails: builder.query<TransactionDetails, { chainId: string; txId: string }>({
      queryFn({ chainId, txId }) {
        return buildQueryFn(() => getTransactionDetails(chainId, txId))
      },
    }),
    getMultipleTransactionDetails: builder.query<TransactionDetails[], { chainId: string; txIds: string[] }>({
      queryFn({ chainId, txIds }) {
        return buildQueryFn(() => Promise.all(txIds.map((txId) => getTransactionDetails(chainId, txId))))
      },
    }),
    getDelegates: builder.query<DelegateResponse, { chainId: string; safeAddress: string }>({
      queryFn({ chainId, safeAddress }) {
        return buildQueryFn(() => getDelegates(chainId, { safe: safeAddress }))
      },
    }),
    ...safeOverviewEndpoints(builder),
  }),
})

export const {
  useGetTransactionDetailsQuery,
  useGetMultipleTransactionDetailsQuery,
  useLazyGetTransactionDetailsQuery,
  useGetDelegatesQuery,
  useGetSafeOverviewQuery,
  useGetMultipleSafeOverviewsQuery,
} = gatewayApi
