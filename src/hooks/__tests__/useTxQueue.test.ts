import { useFirstQueuedNonce, useQueuedTxsLength } from '../useTxQueue'
import * as store from '@/store'
import * as recoveryHooks from '@/features/recovery/hooks/useRecoveryQueue'
import * as safeInfoHooks from '../useSafeInfo'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'
import { DetailedExecutionInfoType, TransactionListItemType } from '@safe-global/safe-gateway-typescript-sdk'
import { renderHook } from '@/tests/test-utils'

describe('useQueuedTxsLength', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return an empty string if there are no queued transactions', () => {
    jest.spyOn(store, 'useAppSelector').mockReturnValue({
      data: {
        results: [],
        next: undefined,
      },
    })
    jest.spyOn(recoveryHooks, 'useRecoveryQueue').mockReturnValue([])

    const result = useQueuedTxsLength()
    expect(result).toEqual('')
  })

  it('should return the length of the queue as a string', () => {
    jest.spyOn(store, 'useAppSelector').mockReturnValue({
      data: {
        results: [
          { type: TransactionListItemType.TRANSACTION },
          { type: TransactionListItemType.TRANSACTION },
          { type: TransactionListItemType.TRANSACTION },
        ],
        next: undefined,
      },
    })
    jest.spyOn(recoveryHooks, 'useRecoveryQueue').mockReturnValue([])

    const result = useQueuedTxsLength()
    expect(result).toEqual('3')
  })

  it('should return the length of the queue as a string with a "+" if there are more pages', () => {
    jest.spyOn(store, 'useAppSelector').mockReturnValue({
      data: {
        results: [
          { type: TransactionListItemType.TRANSACTION },
          { type: TransactionListItemType.TRANSACTION },
          { type: TransactionListItemType.TRANSACTION },
        ],
        next: 'next',
      },
    })
    jest.spyOn(recoveryHooks, 'useRecoveryQueue').mockReturnValue([])

    const result = useQueuedTxsLength()
    expect(result).toEqual('3+')
  })

  it('should return the length of the queue and recovery queue as a string', () => {
    jest.spyOn(store, 'useAppSelector').mockReturnValue({
      data: {
        results: [
          { type: TransactionListItemType.TRANSACTION },
          { type: TransactionListItemType.TRANSACTION },
          { type: TransactionListItemType.TRANSACTION },
        ],
        next: undefined,
      },
    })
    jest.spyOn(recoveryHooks, 'useRecoveryQueue').mockReturnValue([{}, {}] as RecoveryQueueItem[])

    const result = useQueuedTxsLength()
    expect(result).toEqual('5')
  })

  describe('useFirstQueuedNonce', () => {
    it('should return the nonce of the first queued transaction', () => {
      jest.spyOn(safeInfoHooks, 'default').mockReturnValue({ safeAddress: '0x1234', safe: { nonce: -1 } } as any)

      jest.spyOn(store, 'useAppSelector').mockReturnValue({
        data: {
          results: [
            {
              type: TransactionListItemType.LABEL,
            },
            {
              type: TransactionListItemType.TRANSACTION,
              transaction: {
                executionInfo: {
                  type: DetailedExecutionInfoType.MODULE,
                },
              },
            },
            {
              type: TransactionListItemType.TRANSACTION,
              transaction: {
                executionInfo: {
                  type: DetailedExecutionInfoType.MULTISIG,
                  nonce: 1,
                },
              },
            },
            {
              type: TransactionListItemType.TRANSACTION,
              transaction: {
                executionInfo: {
                  type: DetailedExecutionInfoType.MULTISIG,
                  nonce: 2,
                },
              },
            },
          ],

          next: undefined,
        },
      })

      const { result } = renderHook(() => useFirstQueuedNonce())
      expect(result.current).toEqual(1)
    })

    it('should return the safe nonce if no queued transactions', () => {
      jest.spyOn(safeInfoHooks, 'default').mockReturnValue({ safeAddress: '0x1234', safe: { nonce: 10 } } as any)

      jest.spyOn(store, 'useAppSelector').mockReturnValue({
        data: {
          results: [
            {
              type: TransactionListItemType.LABEL,
            },
            {
              type: TransactionListItemType.TRANSACTION,
              transaction: {
                executionInfo: {
                  type: DetailedExecutionInfoType.MODULE,
                },
              },
            },
          ],

          next: undefined,
        },
      })

      const { result } = renderHook(() => useFirstQueuedNonce())
      expect(result.current).toEqual(10)
    })
  })
})
