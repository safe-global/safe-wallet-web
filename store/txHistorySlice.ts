import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type Middleware, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { Loadable } from './common'
import { isTransaction } from '@/components/transactions/utils'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { selectPendingTxs } from './pendingTxsSlice'

interface TxHistoryState extends Loadable {
  page: TransactionListPage
  pageUrl?: string
}

const initialState: TxHistoryState = {
  error: undefined,
  loading: true,
  page: {
    results: [],
    next: '',
    previous: '',
  },
  pageUrl: '',
}

export const txHistorySlice = createSlice({
  name: 'txHistory',
  initialState,
  reducers: {
    setHistoryPage: (state, action: PayloadAction<TransactionListPage | undefined>) => {
      // @ts-ignore: Type instantiation is excessively deep and possibly infinite.
      state.page = action.payload || initialState.page
    },

    setPageUrl: (state, action: PayloadAction<string | undefined>) => {
      state.pageUrl = action.payload
    },
  },
})

export const { setHistoryPage, setPageUrl } = txHistorySlice.actions

export const selectTxHistory = (state: RootState): TxHistoryState => {
  return state[txHistorySlice.name]
}

export const txHistoryMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  switch (action.type) {
    // Dispatch SUCCESS event when pending transaction is in history payload
    case setHistoryPage.type: {
      if (!action.payload) {
        break
      }

      const state = store.getState()
      const pendingTxs = selectPendingTxs(state)

      for (const result of action.payload.results) {
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
