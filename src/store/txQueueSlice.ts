import { createSelector, Middleware } from '@reduxjs/toolkit'
import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { isEqual } from 'lodash'
import type { RootState } from '@/store'
import { makeLoadableSlice } from './common'
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import { trackEvent, TX_LIST_EVENTS } from '@/services/analytics'

const { slice, selector } = makeLoadableSlice('txQueue', undefined as TransactionListPage | undefined)

export const txQueueSlice = slice
export const selectTxQueue = selector

export const selectQueuedTransactions = createSelector(selectTxQueue, (txQueue) => {
  return txQueue.data?.results.filter(isTransactionListItem) || []
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

const trackQueueSize = (prevState: RootState, { payload }: ReturnType<typeof txQueueSlice.actions.set>) => {
  const txQueue = selectTxQueue(prevState)

  if (isEqual(txQueue.data?.results, payload.data?.results)) {
    return
  }

  const transactions = payload.data?.results.filter(isTransactionListItem) || []

  trackEvent({
    ...TX_LIST_EVENTS.QUEUED_TXS,
    label: transactions.length.toString(),
  })
}

export const txQueueMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const prevState = store.getState()

  const result = next(action)

  switch (action.type) {
    case txQueueSlice.actions.set.type: {
      trackQueueSize(prevState, action)
    }
  }

  return result
}
