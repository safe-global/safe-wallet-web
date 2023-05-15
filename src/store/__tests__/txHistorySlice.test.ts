import { createListenerMiddleware } from '@reduxjs/toolkit'
import { LabelValue, TransactionListItemType } from '@safe-global/safe-gateway-typescript-sdk'
import type { TransactionListItem, Label, ConflictHeader, DateLabel } from '@safe-global/safe-gateway-typescript-sdk'

import * as txEvents from '@/services/tx/txEvents'
import { txHistoryListener, txHistorySlice } from '../txHistorySlice'
import type { PendingTxsState } from '../pendingTxsSlice'
import { PendingStatus } from '../pendingTxsSlice'
import type { RootState } from '..'

describe('txHistorySlice', () => {
  describe('txHistoryListener', () => {
    const listenerMiddlewareInstance = createListenerMiddleware<RootState>()

    const txDispatchSpy = jest.spyOn(txEvents, 'txDispatch')

    beforeEach(() => {
      listenerMiddlewareInstance.clearListeners()
      txHistoryListener(listenerMiddlewareInstance)

      jest.clearAllMocks()
    })

    it('should dispatch SUCCESS event if tx is pending', () => {
      const state = {
        pendingTxs: {
          '0x123': {
            chainId: '5',
            safeAddress: '0x0000000000000000000000000000000000000000',
            status: PendingStatus.INDEXING,
            groupKey: 'groupKey',
          },
        } as PendingTxsState,
      } as RootState

      const listenerApi = {
        getState: jest.fn(() => state),
        dispatch: jest.fn(),
      }

      const transaction = {
        type: TransactionListItemType.TRANSACTION,
        transaction: {
          id: '0x123',
        },
      } as TransactionListItem

      const action = txHistorySlice.actions.set({
        loading: false,
        data: {
          results: [transaction],
        },
      })

      listenerMiddlewareInstance.middleware(listenerApi)(jest.fn())(action)

      expect(txDispatchSpy).toHaveBeenCalledWith(txEvents.TxEvent.SUCCESS, {
        txId: '0x123',
        groupKey: 'groupKey',
      })
    })

    it('should not dispatch an event if the history slice is cleared', () => {
      const state = {
        pendingTxs: {
          '0x123': {
            chainId: '5',
            safeAddress: '0x0000000000000000000000000000000000000000',
            status: PendingStatus.INDEXING,
            groupKey: 'groupKey',
          },
        } as PendingTxsState,
      } as RootState

      const listenerApi = {
        getState: jest.fn(() => state),
        dispatch: jest.fn(),
      }

      const transaction = {
        type: TransactionListItemType.TRANSACTION,
        transaction: {
          id: '0x123',
        },
      } as TransactionListItem

      const action = txHistorySlice.actions.set({
        loading: false,
        data: undefined, // Cleared
      })

      listenerMiddlewareInstance.middleware(listenerApi)(jest.fn())(action)

      expect(txDispatchSpy).not.toHaveBeenCalled()
    })

    it('should not dispatch an event for date labels, labels or conflict headers', () => {
      const state = {
        pendingTxs: {
          '0x123': {
            chainId: '5',
            safeAddress: '0x0000000000000000000000000000000000000000',
            status: PendingStatus.INDEXING,
            groupKey: '',
          },
        } as PendingTxsState,
      } as RootState

      const listenerApi = {
        getState: jest.fn(() => state),
        dispatch: jest.fn(),
      }

      const dateLabel: DateLabel = {
        type: TransactionListItemType.DATE_LABEL,
        timestamp: 0,
      }

      const label: Label = {
        label: LabelValue.Queued,
        type: TransactionListItemType.LABEL,
      }

      const conflictHeader: ConflictHeader = {
        nonce: 0,
        type: TransactionListItemType.CONFLICT_HEADER,
      }

      const action = txHistorySlice.actions.set({
        loading: false,
        data: {
          results: [dateLabel, label, conflictHeader],
        },
      })

      listenerMiddlewareInstance.middleware(listenerApi)(jest.fn())(action)

      expect(txDispatchSpy).not.toHaveBeenCalled()
    })

    it('should not dispatch an event if tx is not pending', () => {
      const state = {
        pendingTxs: {
          '0x123': {
            chainId: '5',
            safeAddress: '0x0000000000000000000000000000000000000000',
            status: PendingStatus.INDEXING,
            groupKey: '',
          },
        } as PendingTxsState,
      } as RootState

      const listenerApi = {
        getState: jest.fn(() => state),
        dispatch: jest.fn(),
      }

      const transaction = {
        type: TransactionListItemType.TRANSACTION,
        transaction: {
          id: '0x456',
        },
      } as TransactionListItem

      const action = txHistorySlice.actions.set({
        loading: false,
        data: {
          results: [transaction],
        },
      })

      listenerMiddlewareInstance.middleware(listenerApi)(jest.fn())(action)

      expect(txDispatchSpy).not.toHaveBeenCalled()
    })
  })
})
