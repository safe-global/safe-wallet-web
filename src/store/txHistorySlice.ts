import type { listenerMiddlewareInstance } from '@/store'
import type { TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { selectPendingTxs } from './pendingTxsSlice'
import { makeLoadableSlice } from './common'

const { slice, selector } = makeLoadableSlice('txHistory', undefined as TransactionListPage | undefined)

export const txHistorySlice = slice
export const selectTxHistory = selector

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

        if (pendingTxs[txId]) {
          const HUMAN_DESCRIPTION_FALLBACK =
            'Transaction ' +
            (isMultisigExecutionInfo(result.transaction.executionInfo)
              ? `#${result.transaction.executionInfo.nonce}`
              : '')
          const humanDescription = result.transaction.txInfo?.humanDescription || HUMAN_DESCRIPTION_FALLBACK

          txDispatch(TxEvent.SUCCESS, {
            txId,
            groupKey: pendingTxs[txId].groupKey,
            humanDescription,
          })
        }
      }
    },
  })
}
