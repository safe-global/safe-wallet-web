import { faker } from '@faker-js/faker'
import { TransactionInfoType } from '@safe-global/safe-gateway-typescript-sdk'
import type { TransactionListItem } from '@safe-global/safe-gateway-typescript-sdk'

import { groupConflictingTxs, groupRecoveryTransactions, _getRecoveryCancellations } from '@/utils/tx-list'

describe('tx-list', () => {
  describe('groupConflictingTxs', () => {
    it('should group conflicting transactions', () => {
      const list = [
        { type: 'CONFLICT_HEADER' },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 1,
          },
          conflictType: 'HasNext',
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 2,
          },
          conflictType: 'End',
        },
      ]

      const result = groupConflictingTxs(list as TransactionListItem[])
      expect(result).toEqual([
        [
          {
            type: 'TRANSACTION',
            transaction: {
              id: 1,
            },
            conflictType: 'HasNext',
          },
          {
            type: 'TRANSACTION',
            transaction: {
              id: 2,
            },
            conflictType: 'End',
          },
        ],
      ])
    })

    it('should organise group by timestamp', () => {
      const list = [
        { type: 'CONFLICT_HEADER' },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 1,
            timestamp: 1,
          },
          conflictType: 'HasNext',
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 2,
            timestamp: 2,
          },
          conflictType: 'End',
        },
      ]

      const result = groupConflictingTxs(list as TransactionListItem[])
      expect(result).toEqual([
        [
          {
            type: 'TRANSACTION',
            transaction: {
              id: 2,
              timestamp: 2,
            },
            conflictType: 'End',
          },
          {
            type: 'TRANSACTION',
            transaction: {
              id: 1,
              timestamp: 1,
            },
            conflictType: 'HasNext',
          },
        ],
      ])
    })

    it('should return non-conflicting transaction lists as is', () => {
      const list = [
        {
          type: 'TRANSACTION',
          transaction: {
            id: 1,
          },
          conflictType: 'None',
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 2,
          },
          conflictType: 'None',
        },
      ]

      const result = groupConflictingTxs(list as unknown as TransactionListItem[])
      expect(result).toEqual(list)
    })
  })

  describe('getRecoveryCancellations', () => {
    it('should return cancellation transactions', () => {
      const moduleAddress = faker.finance.ethereumAddress()

      const transactions = [
        {
          transaction: {
            txInfo: {
              type: TransactionInfoType.CUSTOM,
              to: {
                value: moduleAddress,
              },
              methodName: 'enableModule',
            },
          },
        },
        {
          transaction: {
            txInfo: {
              type: TransactionInfoType.TRANSFER,
            },
          },
        },
        {
          transaction: {
            txInfo: {
              type: TransactionInfoType.CUSTOM,
              to: {
                value: moduleAddress,
              },
              methodName: 'setTxNonce',
            },
          },
        },
      ]

      expect(_getRecoveryCancellations(moduleAddress, transactions as any)).toEqual([
        {
          transaction: {
            txInfo: {
              type: TransactionInfoType.CUSTOM,
              to: {
                value: moduleAddress,
              },
              methodName: 'setTxNonce',
            },
          },
        },
      ])
    })
  })

  describe('groupRecoveryTransactions', () => {
    it('should group recovery transactions with their cancellations', () => {
      const moduleAddress = faker.finance.ethereumAddress()

      const queue = [
        {
          transaction: {
            txInfo: {
              type: TransactionInfoType.CUSTOM,
              to: {
                value: moduleAddress,
              },
              methodName: 'enableModule',
            },
          },
        },
        {
          transaction: {
            txInfo: {
              type: TransactionInfoType.TRANSFER,
            },
          },
        },
        {
          transaction: {
            txInfo: {
              type: TransactionInfoType.CUSTOM,
              to: {
                value: moduleAddress,
              },
              methodName: 'setTxNonce',
            },
          },
        },
      ]

      const recoveryQueue = [
        {
          address: moduleAddress,
        },
      ]

      expect(groupRecoveryTransactions(queue as any, recoveryQueue as any)).toEqual([
        [
          {
            address: moduleAddress,
          },
          {
            transaction: {
              txInfo: {
                type: TransactionInfoType.CUSTOM,
                to: {
                  value: moduleAddress,
                },
                methodName: 'setTxNonce',
              },
            },
          },
        ],
      ])
    })
  })
})
