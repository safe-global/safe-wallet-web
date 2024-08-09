import { createApi } from '@reduxjs/toolkit/query/react'
import { getDelegates } from '@safe-global/safe-gateway-typescript-sdk'
import type { DelegateResponse } from '@safe-global/safe-gateway-typescript-sdk/dist/types/delegates'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

const noopBaseQuery = async () => ({ data: null })

export const gatewayApi = createApi({
  reducerPath: 'gatewayApi',
  baseQuery: noopBaseQuery,
  endpoints: (builder) => ({
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
  }),
})

export const { useGetDelegatesQuery } = gatewayApi
