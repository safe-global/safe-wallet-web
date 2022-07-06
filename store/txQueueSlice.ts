import { createSelector } from '@reduxjs/toolkit'
import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { RootState } from '@/store'
import { isMultisigExecutionInfo, isTransaction } from '@/utils/transaction-guards'
import { makeLoadableSlice, makeSliceSelector } from './common'

export const txQueueSlice = makeLoadableSlice<TransactionListPage>('txQueue')
export const selectTxQueue = makeSliceSelector<TransactionListPage>(txQueueSlice)

export const selectQueuedTransactions = createSelector(selectTxQueue, (txQueue) => {
  return (txQueue.data?.results || []).filter(isTransaction)
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
