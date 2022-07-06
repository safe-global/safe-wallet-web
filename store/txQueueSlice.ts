import { createSelector } from '@reduxjs/toolkit'
import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { RootState } from '@/store'
import { isMultisigExecutionInfo, isTransaction } from '@/utils/transaction-guards'
import { makeLoadableSlice } from './common'

const { slice, selector } = makeLoadableSlice('txQueue', {
  results: [],
  next: '',
  previous: '',
} as TransactionListPage)

export const txQueueSlice = slice
export const selectTxQueue = selector

export const selectQueuedTransactions = createSelector(selectTxQueue, (txQueue) => {
  return txQueue.data.results.filter(isTransaction)
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
