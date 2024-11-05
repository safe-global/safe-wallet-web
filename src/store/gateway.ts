import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

import { asError } from '@/src/services/exceptions/utils'
import { getTransactionHistory, TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'

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
    getTransactionsHistory: builder.query<
      TransactionListPage,
      { chainId: string; safeAddress: string; pageUrl?: string }
    >({
      queryFn({ chainId, safeAddress, pageUrl }) {
        return buildQueryFn(() =>
          getTransactionHistory(
            chainId,
            safeAddress,
            {
              trusted: false,
            },
            pageUrl,
          ),
        )
      },
    }),
  }),
})

export const { useGetTransactionsHistoryQuery } = gatewayApi
