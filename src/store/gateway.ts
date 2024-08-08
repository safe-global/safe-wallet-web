import { createApi } from '@reduxjs/toolkit/query/react'

import { getTransactionDetails, type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import type { BaseQueryFn } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query/react'

const noopBaseQuery: BaseQueryFn<
  unknown, // QueryArg type
  unknown, // ResultType
  FetchBaseQueryError, // ErrorType
  {}, // DefinitionExtraOptions
  {} // Meta
> = async () => ({ data: null })

export const gatewayApi = createApi({
  reducerPath: 'gatewayApi',
  baseQuery: noopBaseQuery,
  endpoints: (builder) => ({
    getTransactionDetails: builder.query<TransactionDetails, { chainId: string; txId: string }>({
      async queryFn({ chainId, txId }) {
        try {
          const txDetails = await getTransactionDetails(chainId, txId)
          return { data: txDetails }
        } catch (error) {
          return { error: error as FetchBaseQueryError }
        }
      },
    }),
    getMultipleTransactionDetails: builder.query<TransactionDetails[], { chainId: string; txIds: string[] }>({
      async queryFn({ chainId, txIds }) {
        try {
          const txDetails = await Promise.all(txIds.map((txId) => getTransactionDetails(chainId, txId)))
          return { data: txDetails }
        } catch (error) {
          return { error: error as FetchBaseQueryError }
        }
      },
    }),
  }),
})

export const {
  useGetTransactionDetailsQuery,
  useGetMultipleTransactionDetailsQuery,
  useLazyGetTransactionDetailsQuery,
} = gatewayApi
