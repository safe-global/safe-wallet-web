import { Middleware } from '@reduxjs/toolkit'
import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { RootState } from '@/store'
import { isTransactionListItem } from '@/utils/transaction-guards'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { selectPendingTxs } from './pendingTxsSlice'
import { makeLoadableSlice } from './common'

const initialState: TransactionListPage = {
  results: [],
  next: '',
  previous: '',
}

const { slice, selector } = makeLoadableSlice('txHistory', initialState)

export const txHistorySlice = slice
export const selectTxHistory = selector

export const txHistoryMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  switch (action.type) {
    // Dispatch SUCCESS event when pending transaction is in history payload
    case txHistorySlice.actions.set.type: {
      const state = store.getState()
      const pendingTxs = selectPendingTxs(state)
      const { payload } = action as ReturnType<typeof txHistorySlice.actions.set>

      if (!payload.data) return

      for (const result of payload.data.results) {
        if (!isTransactionListItem(result)) {
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
