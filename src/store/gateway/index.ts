import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

import { TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import { TxHistoryListParams } from './transactions-history/types'
import { getTxHistoryList } from './transactions-history'
import { getPendingTxs } from './pending-transactions'
import { PendingTxParams } from './pending-transactions/types'

export const gatewayApi = createApi({
  reducerPath: 'gatewayApi',
  baseQuery: fakeBaseQuery<Error>(),
  endpoints: (builder) => ({
    getTxHistory: builder.query<TransactionListPage, TxHistoryListParams>({
      queryFn: getTxHistoryList,
    }),
    getPendingTxs: builder.query<TransactionListPage, PendingTxParams>({
      queryFn: getPendingTxs,
    }),
  }),
})

export const { useGetTxHistoryQuery, useGetPendingTxsQuery } = gatewayApi
