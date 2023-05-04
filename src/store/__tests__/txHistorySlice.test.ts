import { txHistoryMiddleware, txHistorySlice } from '../txHistorySlice'
import * as txEvents from '@/services/tx/txEvents'
import * as mockPendingTxs from '../pendingTxsSlice'
import { PendingStatus } from '../pendingTxsSlice'
import { TransactionListItemType } from '@safe-global/safe-gateway-typescript-sdk'
import { TxEvent } from '@/services/tx/txEvents'

const create = () => {
  const store: any = {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
  }
  const next = jest.fn()

  const invoke = (action: any) => txHistoryMiddleware(store)(next)(action)

  return { store, next, invoke }
}

jest.mock('@/store/common', () => ({
  makeLoadableSlice: jest.fn(() => ({
    slice: {
      actions: {
        set: {
          type: 'SET_HISTORY',
        },
      },
    },
    selector: jest.fn(() => ({ data: undefined })),
  })),
}))

describe('txHistorySlice', () => {
  let txDispatchSpy: jest.SpyInstance
  describe('txHistoryMiddleware', () => {
    txDispatchSpy = jest.spyOn(txEvents, 'txDispatch')
    txDispatchSpy.mockImplementation(() => {})
    jest.spyOn(mockPendingTxs, 'selectPendingTxs').mockImplementation(() => ({
      ['0x123']: {
        chainId: '5',
        safeAddress: '0x0000000000000000000000000000000000000000',
        status: PendingStatus.INDEXING,
        groupKey: '0x123456',
      },
    }))

    it('should not dispatch event if tx is not pending', () => {
      const { next, invoke } = create()
      const action = {
        type: txHistorySlice.actions.set.type,
        payload: {
          data: {
            results: [
              {
                type: TransactionListItemType.TRANSACTION,
                transaction: {
                  id: '0x234',
                },
              },
            ],
          },
        },
      }
      invoke(action)
      expect(next).toHaveBeenCalledWith(action)
      expect(txDispatchSpy).not.toHaveBeenCalled()
    })
    it('should dispatch SUCCESS event if tx is pending', () => {
      const { next, invoke } = create()
      const action = {
        type: txHistorySlice.actions.set.type,
        payload: {
          data: {
            results: [
              {
                type: TransactionListItemType.TRANSACTION,
                transaction: {
                  id: '0x123',
                },
              },
            ],
          },
        },
      }
      invoke(action)
      expect(next).toHaveBeenCalledWith(action)
      expect(txDispatchSpy).toHaveBeenCalledWith(TxEvent.SUCCESS, { txId: '0x123', groupKey: '0x123456' })
    })
  })
})
