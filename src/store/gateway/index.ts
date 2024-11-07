import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

import { TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import { TxHistoryListParams } from './transactions-history/types'
import { getTxHistoryList } from './transactions-history'

export const gatewayApi = createApi({
  reducerPath: 'gatewayApi',
  baseQuery: fakeBaseQuery<Error>(),
  endpoints: (builder) => ({
    getTransactionsHistory: builder.query<TransactionListPage, TxHistoryListParams>({
      queryFn: getTxHistoryList,
    }),
  }),
})

export const { useGetTransactionsHistoryQuery } = gatewayApi
