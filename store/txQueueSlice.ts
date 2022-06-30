import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { Loadable } from './common'
import { isMultisigExecutionInfo, isTransaction } from '@/utils/transaction-guards'

interface TxQueueState extends Loadable {
  page: TransactionListPage
}

const initialState: TxQueueState = {
  loading: true,
  page: {
    results: [],
    next: '',
    previous: '',
  },
}

export const txQueueSlice = createSlice({
  name: 'txQueue',
  initialState,
  reducers: {
    setQueue: (_, action: PayloadAction<TxQueueState | undefined>) => {
      return action.payload || initialState
    },
  },
})

export const { setQueue } = txQueueSlice.actions

export const selectTxQueue = (state: RootState): TxQueueState => {
  return state[txQueueSlice.name]
}

export const selectQueuedTransactions = createSelector(selectTxQueue, (txQueue) => {
  return txQueue.page.results.filter(isTransaction)
})

export const selectQueuedTransactionsByNonce = createSelector(
  selectQueuedTransactions,
  (_: RootState, nonce?: number) => nonce,
  (queuedTransactions, nonce?: number) => {
    return queuedTransactions.filter((item) => {
      return isMultisigExecutionInfo(item.transaction.executionInfo) && item.transaction.executionInfo.nonce === nonce
    })
  },
)
