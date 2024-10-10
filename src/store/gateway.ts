import { createApi } from '@reduxjs/toolkit/query/react'

import {
  type AllOwnedSafes,
  type OwnedSafes,
  getAllOwnedSafes,
  getOwnedSafes,
  getTransactionDetails,
  type TransactionDetails,
} from '@safe-global/safe-gateway-typescript-sdk'
import type { BaseQueryFn } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query/react'
import { getDelegates } from '@safe-global/safe-gateway-typescript-sdk'
import type { DelegateResponse } from '@safe-global/safe-gateway-typescript-sdk/dist/types/delegates'

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
    getDelegates: builder.query<DelegateResponse, { chainId: string; safeAddress: string }>({
      async queryFn({ chainId, safeAddress }) {
        try {
          const delegates = await getDelegates(chainId, { safe: safeAddress })
          return { data: delegates }
        } catch (error) {
          return { error: error as FetchBaseQueryError }
        }
      },
    }),
    getOwnedSafes: builder.query<OwnedSafes, { chainId: string; address: string }>({
      async queryFn({ chainId, address }) {
        try {
          const ownedSafes = await getOwnedSafes(chainId, address)
          return { data: ownedSafes }
        } catch (error) {
          return { error: error as FetchBaseQueryError }
        }
      },
    }),
    getAllOwnedSafes: builder.query<AllOwnedSafes, { address: string }>({
      async queryFn({ address }) {
        try {
          const ownedSafes = await getAllOwnedSafes(address)
          return { data: ownedSafes }
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
  useGetDelegatesQuery,
  useGetAllOwnedSafesQuery,
  useGetOwnedSafesQuery,
} = gatewayApi
