import type { listenerMiddlewareInstance } from '@/store'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { OrderStatuses } from '@safe-global/safe-gateway-typescript-sdk'
import type { RootState } from '@/store'
import { isSwapTxInfo, isTransactionListItem } from '@/utils/transaction-guards'
import { txHistorySlice } from '@/store/txHistorySlice'
import { showNotification } from '@/store/notificationsSlice'
import { selectSafeInfo } from '@/store/safeInfoSlice'

type AllStatuses = OrderStatuses | 'created'
type Order = {
  orderUid: string
  status: AllStatuses
  txId?: string
}

type SwapOrderState = {
  [orderUid: string]: Order
}

const initialState: SwapOrderState = {}

const slice = createSlice({
  name: 'swapOrders',
  initialState,
  reducers: {
    setSwapOrder: (state, { payload }: { payload: Order }): SwapOrderState => {
      return {
        ...state,
        [payload.orderUid]: {
          ...state[payload.orderUid],
          ...payload,
        },
      }
    },
    deleteSwapOrder: (state, { payload }: { payload: string }): SwapOrderState => {
      const newState = { ...state }
      delete newState[payload]
      return newState
    },
  },
})

export const { setSwapOrder, deleteSwapOrder } = slice.actions
const selector = (state: RootState) => state[slice.name]
export const swapOrderSlice = slice
export const selectAllSwapOrderStatuses = selector

export const selectSwapOrderStatus = createSelector(
  [selectAllSwapOrderStatuses, (_, uid: string) => uid],
  (allOrders, uid): undefined | AllStatuses => {
    return allOrders ? allOrders[uid]?.status : undefined
  },
)

const groupKey = 'swap-order-status'
/**
 * Listen for changes in the swap order status and determines if a notification should be shown
 *
 * Some gotchas:
 * If the status of an order is created, presignaturePending, open - we always display a notification.
 * Here it doesn't matter if the order was started through the UI or the gateway returned that order on a new browser instance.
 *
 * For fulfilled, expired, cancelled - we only display a notification if the old status is not undefined.
 * Why? Because if the status is undefined, it means that the order was just fetched from the gateway, and
 * it was already processed and there is no need to show a notification. If the status is != undefined, it means
 * that the user has started the swap through the UI (or has continued it from a previous state), and we should show a notification.
 *
 * @param listenerMiddleware
 */
export const swapOrderStatusListener = (listenerMiddleware: typeof listenerMiddlewareInstance) => {
  listenerMiddleware.startListening({
    actionCreator: slice.actions.setSwapOrder,
    effect: (action, listenerApi) => {
      const { dispatch } = listenerApi
      const swapOrder = action.payload
      const oldStatus = selectSwapOrderStatus(listenerApi.getOriginalState(), swapOrder.orderUid)
      const newStatus = swapOrder.status

      if (oldStatus === newStatus || newStatus === undefined) {
        return
      }

      switch (newStatus) {
        case 'created':
          const safeInfo = selectSafeInfo(listenerApi.getState())

          dispatch(
            showNotification({
              title: 'Order created',
              message:
                safeInfo.data?.threshold === 1
                  ? 'Waiting for the transaction to be executed'
                  : 'Waiting for confirmation from signers of your Safe',
              groupKey,
              variant: 'info',
            }),
          )

          break
        case 'presignaturePending':
          dispatch(
            showNotification({
              title: 'Order waiting for signature',
              message: 'Waiting for confirmation from signers of your Safe',
              groupKey,
              variant: 'info',
            }),
          )
          break
        case 'open':
          dispatch(
            showNotification({
              title: 'Order transaction confirmed',
              message: 'Waiting for order execution by the CoW Protocol',
              groupKey,
              variant: 'info',
            }),
          )
          break
        case 'fulfilled':
          dispatch(slice.actions.deleteSwapOrder(swapOrder.orderUid))
          if (oldStatus === undefined) {
            return
          }
          dispatch(
            showNotification({
              title: 'Order executed',
              message: 'Your order has been successful',
              groupKey,
              variant: 'success',
            }),
          )
          break
        case 'expired':
          dispatch(slice.actions.deleteSwapOrder(swapOrder.orderUid))
          if (oldStatus === undefined) {
            return
          }
          dispatch(
            showNotification({
              title: 'Order expired',
              message: 'Your order has reached the expiry time and has become invalid',
              groupKey,
              variant: 'warning',
            }),
          )
          break
        case 'cancelled':
          dispatch(slice.actions.deleteSwapOrder(swapOrder.orderUid))
          if (oldStatus === undefined) {
            return
          }
          dispatch(
            showNotification({
              title: 'Order cancelled',
              message: 'Your order has been cancelled',
              groupKey,
              variant: 'warning',
            }),
          )
          break
      }
    },
  })
}

/**
 * Listen for changes in the tx history, check if the transaction is a swap order and update the status of the order
 * @param listenerMiddleware
 */
export const swapOrderListener = (listenerMiddleware: typeof listenerMiddlewareInstance) => {
  listenerMiddleware.startListening({
    actionCreator: txHistorySlice.actions.set,
    effect: (action, listenerApi) => {
      if (!action.payload.data) {
        return
      }

      for (const result of action.payload.data.results) {
        if (!isTransactionListItem(result)) {
          continue
        }

        if (isSwapTxInfo(result.transaction.txInfo)) {
          const swapOrder = result.transaction.txInfo
          const oldStatus = selectSwapOrderStatus(listenerApi.getOriginalState(), swapOrder.uid)

          const finalStatuses: AllStatuses[] = ['fulfilled', 'expired', 'cancelled']
          if (oldStatus === swapOrder.status || (oldStatus === undefined && finalStatuses.includes(swapOrder.status))) {
            continue
          }

          listenerApi.dispatch({
            type: slice.actions.setSwapOrder.type,
            payload: {
              orderUid: swapOrder.uid,
              status: swapOrder.status,
              txId: result.transaction.id,
            },
          })
        }
      }
    },
  })
}
