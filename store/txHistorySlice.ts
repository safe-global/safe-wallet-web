import { Middleware } from '@reduxjs/toolkit'
import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { RootState } from '@/store'
import { isTransaction } from '@/utils/transaction-guards'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { selectPendingTxs } from './pendingTxsSlice'
import { makeLoadableSlice } from './common'

const { slice, selector } = makeLoadableSlice('txHistory', {
  results: [],
  next: '',
  previous: '',
} as TransactionListPage)

export const txHistorySlice = slice
export const selectTxHistory = selector

export const txHistoryMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  switch (action.type) {
    // Dispatch SUCCESS event when pending transaction is in history payload
    case txHistorySlice.actions.set.type: {
      const state = store.getState()
      const pendingTxs = selectPendingTxs(state)

      for (const result of action.payload.page.results) {
        if (!isTransaction(result)) {
          continue
        }

        const { id } = result.transaction
        if (pendingTxs[id]) {
          txDispatch(TxEvent.SUCCESS, { txId: id })
        }
      }
    }
  }

  return result
}
