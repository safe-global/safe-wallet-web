import { txQueueMiddleware, txQueueSlice } from '../txQueueSlice'
import * as txEvents from '@/services/tx/txEvents'

import * as mockPendingTxs from '../pendingTxsSlice'
import { PendingStatus } from '../pendingTxsSlice'
import { DetailedExecutionInfoType, TransactionListItemType } from '@safe-global/safe-gateway-typescript-sdk'
import { TxEvent } from '@/services/tx/txEvents'

const create = () => {
  const store: any = {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
  }
  const next = jest.fn()

  const invoke = (action: any) => txQueueMiddleware(store)(next)(action)

  return { store, next, invoke }
}

jest.mock('@/store/common', () => ({
  makeLoadableSlice: jest.fn(() => ({
    slice: {
      actions: {
        set: {
          type: 'SET_QUEUE',
        },
      },
    },
    selector: jest.fn(() => ({ data: undefined })),
  })),
}))

describe('txQueueSlice', () => {
  let txDispatchSpy: jest.SpyInstance
  beforeEach(() => {
    txDispatchSpy = jest.spyOn(txEvents, 'txDispatch')
    txDispatchSpy.mockImplementation(() => {})
    jest.spyOn(mockPendingTxs, 'selectPendingTxs').mockImplementation(() => ({
      ['0x123']: {
        chainId: '5',
        safeAddress: '0x0000000000000000000000000000000000000000',
        status: PendingStatus.SIGNING,
        signerAddress: '0x456',
      },
    }))
  })

  it('should not dispatch event if signature is still missing', () => {
    const { next, invoke } = create()
    const action = {
      type: txQueueSlice.actions.set.type,
      payload: {
        data: {
          results: [
            {
              type: TransactionListItemType.TRANSACTION,
              transaction: {
                id: '0x123',
                executionInfo: {
                  type: DetailedExecutionInfoType.MULTISIG,
                  missingSigners: [
                    {
                      value: '0x456',
                    },
                  ],
                },
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

  it('should dispatch SIGNATURE_INDEXED event for added signature', () => {
    const { next, invoke } = create()
    const action = {
      type: txQueueSlice.actions.set.type,
      payload: {
        data: {
          results: [
            {
              type: TransactionListItemType.TRANSACTION,
              transaction: {
                id: '0x123',
                executionInfo: {
                  type: DetailedExecutionInfoType.MULTISIG,
                  missingSigners: [],
                },
              },
            },
          ],
        },
      },
    }
    invoke(action)
    expect(next).toHaveBeenCalledWith(action)
    expect(txDispatchSpy).toHaveBeenCalledWith(TxEvent.SIGNATURE_INDEXED, { txId: '0x123' })
  })
})
