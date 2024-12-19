import type { listenerMiddlewareInstance } from '@/store'
import { createSelector } from '@reduxjs/toolkit'
import type { TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import {
  isCreationTxInfo,
  isIncomingTransfer,
  isMultisigExecutionInfo,
  isTransactionListItem,
} from '@/utils/transaction-guards'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { clearPendingTx, selectPendingTxs } from './pendingTxsSlice'
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

        const pendingTxByNonce = Object.entries(pendingTxs).find(([, pendingTx]) =>
          isMultisigExecutionInfo(result.transaction.executionInfo)
            ? pendingTx.nonce === result.transaction.executionInfo.nonce
            : false,
        )

        if (!pendingTxByNonce) continue

        const txId = result.transaction.id

        const [pendingTxId, pendingTx] = pendingTxByNonce

        if (pendingTxId === txId) {
          const txHash = 'txHash' in pendingTx ? pendingTx.txHash : undefined
          txDispatch(TxEvent.SUCCESS, {
            nonce: pendingTx.nonce,
            txId,
            groupKey: pendingTxs[txId].groupKey,
            txHash,
          })
        } else {
          // There is a pending tx with the same nonce as a history tx but their txIds don't match
          listenerApi.dispatch(clearPendingTx({ txId: pendingTxId }))
        }
      }
    },
  })
}
