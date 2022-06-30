import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type Middleware, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { Loadable } from './common'
import { isTransaction } from '@/utils/transaction-guards'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { selectPendingTxs } from './pendingTxsSlice'

interface TxHistoryState extends Loadable {
  page: TransactionListPage
}

const initialState: TxHistoryState = {
  loading: true,
  page: {
    results: [],
    next: '',
    previous: '',
  },
}

export const txHistorySlice = createSlice({
  name: 'txHistory',
  initialState,
  reducers: {
    setHistory: (_, action: PayloadAction<TxHistoryState | undefined>) => {
      return action.payload || initialState
    },
  },
})

export const { setHistory } = txHistorySlice.actions

export const selectTxHistory = (state: RootState): TxHistoryState => {
  return state[txHistorySlice.name]
}

export const txHistoryMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  switch (action.type) {
    // Dispatch SUCCESS event when pending transaction is in history payload
    case setHistory.type: {
      if (!action.payload) {
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
