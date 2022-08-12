import { createSelector } from '@reduxjs/toolkit'
import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { RootState } from '@/store'
import { makeLoadableSlice } from './common'
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'

const initialState: TransactionListPage = {
  results: [],
  next: '',
  previous: '',
}

const { slice, selector } = makeLoadableSlice('txQueue', initialState)

export const txQueueSlice = slice
export const selectTxQueue = selector

export const selectQueuedTransactions = createSelector(selectTxQueue, (txQueue) => {
  return txQueue.data.results.filter(isTransactionListItem)
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
