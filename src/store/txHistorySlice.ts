import type { listenerMiddlewareInstance } from '@/store'
import { createSelector } from '@reduxjs/toolkit'
import type { TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import { isCreationTxInfo, isIncomingTransfer, isTransactionListItem } from '@/utils/transaction-guards'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { selectPendingTxs } from './pendingTxsSlice'
import { makeLoadableSlice } from './common'

const { slice, selector } = makeLoadableSlice('txHistory', undefined as TransactionListPage | undefined)

export const txHistorySlice = slice
export const selectTxHistory = selector

export const selectOutgoingTransactions = createSelector(selectTxHistory, (txHistory) => {
  return txHistory.data?.results.filter(isTransactionListItem).filter((tx) => {
    return !isIncomingTransfer(tx.transaction.txInfo) && !isCreationTxInfo(tx.transaction.txInfo)
  })
})

export const txHistoryListener = (listenerMiddleware: typeof listenerMiddlewareInstance) => {
  listenerMiddleware.startListening({
    actionCreator: txHistorySlice.actions.set,
    effect: (action, listenerApi) => {
      if (!action.payload.data) {
        return
      }

      const pendingTxs = selectPendingTxs(listenerApi.getState())

      for (const result of action.payload.data.results) {
        if (!isTransactionListItem(result)) {
          continue
        }

        const txId = result.transaction.id

        const pendingTx = pendingTxs[txId]

        if (pendingTx) {
          const txHash = 'txHash' in pendingTx ? pendingTx.txHash : undefined
          txDispatch(TxEvent.SUCCESS, {
            txId,
            groupKey: pendingTxs[txId].groupKey,
            txHash,
          })
        }
      }
    },
  })
}
