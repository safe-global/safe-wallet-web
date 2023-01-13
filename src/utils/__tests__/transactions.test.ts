import type { ConflictHeader, DateLabel, Label, Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import { getQueuedTransactionCount } from '../transactions'

describe('transactions', () => {
  describe('getQueuedTransactionCount', () => {
    it('should return 0 if no txPage is provided', () => {
      expect(getQueuedTransactionCount()).toBe('0')
    })

    it('should return 0 if no results exist', () => {
      const txPage = {
        next: undefined,
        previous: undefined,
        results: [],
      }
      expect(getQueuedTransactionCount(txPage)).toBe('0')
    })

    it('should only return the count of transactions', () => {
      const txPage = {
        next: undefined,
        previous: undefined,
        results: [
          { timestamp: 0, type: 'DATE_LABEL' } as DateLabel,
          { label: 'Next', type: 'LABEL' } as Label,
          { nonce: 0, type: 'CONFLICT_HEADER' } as ConflictHeader,
        ],
      }
      expect(getQueuedTransactionCount(txPage)).toBe('0')
    })

    it('should return > n if there is a next page', () => {
      const txPage = {
        next: 'fakeNextUrl.com',
        previous: undefined,
        results: [
          { type: 'TRANSACTION', transaction: { executionInfo: { type: 'MULTISIG', nonce: 0 } } } as Transaction,
          { type: 'TRANSACTION', transaction: { executionInfo: { type: 'MULTISIG', nonce: 1 } } } as Transaction,
        ],
      }
      expect(getQueuedTransactionCount(txPage)).toBe('> 2')
    })

    it('should only count transactions of different nonces', () => {
      const txPage = {
        next: undefined,
        previous: undefined,
        results: [
          {
            type: 'TRANSACTION',
            transaction: { executionInfo: { type: 'MULTISIG', nonce: 0 } },
          } as Transaction,
          {
            type: 'TRANSACTION',
            transaction: { executionInfo: { type: 'MULTISIG', nonce: 0 } },
          } as Transaction,
        ],
      }
      expect(getQueuedTransactionCount(txPage)).toBe('1')
    })
  })
})
