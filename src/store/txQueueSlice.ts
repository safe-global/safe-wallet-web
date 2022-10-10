import type { Middleware } from '@reduxjs/toolkit'
import { createSelector } from '@reduxjs/toolkit'
import type { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { isEqual } from 'lodash'
import type { RootState } from '@/store'
import { makeLoadableSlice } from './common'
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import { trackEvent, TX_LIST_EVENTS } from '@/services/analytics'
import { selectPendingTxs } from './pendingTxsSlice'
import { sameAddress } from '@/utils/addresses'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'

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

      // Update proposed txs if signature was added successfully
      const state = store.getState()
      const pendingTxs = selectPendingTxs(state)

      const { payload } = action as ReturnType<typeof txQueueSlice.actions.set>
      const results = payload.data?.results
      if (!results) {
        return
      }

      for (const result of results) {
        if (!isTransactionListItem(result)) {
          continue
        }

        const id = result.transaction.id

        const pendingTx = pendingTxs[id]
        if (!pendingTx) {
          continue
        }

        const awaitingSigner = pendingTx.signerAddress
        if (!awaitingSigner) {
          continue
        }

        // The transaction is waiting for a signature of awaitingSigner
        if (
          isMultisigExecutionInfo(result.transaction.executionInfo) &&
          !result.transaction.executionInfo.missingSigners?.some((address) =>
            sameAddress(address.value, awaitingSigner),
          )
        ) {
          txDispatch(TxEvent.SIGNATURE_INDEXED, { txId: id })
        }
      }
    }
  }

  return result
}
