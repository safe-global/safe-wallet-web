import { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppThunk, RootState } from '@/store'
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

export type SetHistoryPageAction = PayloadAction<TransactionListPage | undefined>

export const txHistorySlice = createSlice({
  name: 'txHistory',
  initialState,
  reducers: {
    setHistoryPage: (state, action: SetHistoryPageAction) => {
      // @ts-ignore: Type instantiation is excessively deep and possibly infinite.
      state.page = action.payload || initialState.page
    },

    setPageUrl: (state, action: PayloadAction<string | undefined>) => {
      state.pageUrl = action.payload
    },
  },
})

export const setHistoryPage = (payload: TransactionListPage | undefined): AppThunk => {
  return (dispatch, getState) => {
    if (payload?.results) {
      const pendingTxs = selectPendingTxs(getState())

      if (Object.keys(pendingTxs).length === 0) {
        return
      }

      for (const result of payload.results) {
        if (!isTransaction(result)) {
          continue
        }

        const { id } = result.transaction

        if (pendingTxs[id]) {
          txDispatch(TxEvent.SUCCESS, { txId: id })
        }
      }
    }

    return dispatch(txHistorySlice.actions.setHistoryPage(payload))
  }
}

export const { setPageUrl } = txHistorySlice.actions

export const selectTxHistory = (state: RootState): TxHistoryState => {
  return state[txHistorySlice.name]
}
