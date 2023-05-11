import { isAllOf } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'
import type { TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import type { RootState } from '@/store'
import { isTransactionListItem } from '@/utils/transaction-guards'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { selectPendingTxs } from './pendingTxsSlice'
import { makeLoadableSlice } from './common'

const { slice, selector } = makeLoadableSlice('txHistory', undefined as TransactionListPage | undefined)

export const txHistorySlice = slice
export const selectTxHistory = selector

export const txHistoryMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  if (isAllOf(txHistorySlice.actions.set) && action.payload.data) {
    const state = store.getState()
    const pendingTxs = selectPendingTxs(state)

    for (const result of action.payload.data.results) {
      if (!isTransactionListItem(result)) {
        continue
      }

      const { id } = result.transaction
      if (pendingTxs[id]) {
        txDispatch(TxEvent.SUCCESS, { txId: id, groupKey: pendingTxs[id].groupKey })
      }
    }
  }

  return result
}
