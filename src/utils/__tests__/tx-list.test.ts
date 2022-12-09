import type { TransactionListItem } from '@safe-global/safe-gateway-typescript-sdk'

import { groupConflictingTxs } from '@/utils/tx-list'

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
})
