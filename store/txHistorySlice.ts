import { Middleware } from '@reduxjs/toolkit'
import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { RootState } from '@/store'
import { isTransaction } from '@/utils/transaction-guards'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { selectPendingTxs } from './pendingTxsSlice'
import { makeLoadableSlice, makeSliceSelector } from './common'

export const txHistorySlice = makeLoadableSlice<TransactionListPage>('txHistory')
export const selectTxHistory = makeSliceSelector<TransactionListPage>(txHistorySlice)

export const txHistoryMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  switch (action.type) {
    // Dispatch SUCCESS event when pending transaction is in history payload
    case txHistorySlice.actions.set.type: {
      if (!action.payload?.page) {
        break
      }

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
