import type {
  ConflictHeader,
  DateLabel,
  Label,
  SafeAppData,
  Transaction,
} from '@safe-global/safe-gateway-typescript-sdk'
import { getQueuedTransactionCount, getTxOrigin } from '../transactions'

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

  describe('getTxOrigin', () => {
    it('should return undefined if no app is provided', () => {
      expect(getTxOrigin()).toBe(undefined)
    })

    it('should return a stringified object with the app name and url', () => {
      const app = {
        url: 'https://test.com',
        name: 'Test name',
      } as SafeAppData

      expect(getTxOrigin(app)).toBe('{"url":"https://test.com","name":"Test name"}')
    })

    it('should limit the origin to 200 characters with preference of the URL', () => {
      const app = {
        url: 'https://test.com/' + 'a'.repeat(160),
        name: 'Test name',
      } as SafeAppData

      const result = getTxOrigin(app)

      expect(result?.length).toBe(200)

      expect(result).toBe(
        '{"url":"https://test.com/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","name":"Tes"}',
      )
    })

    it('should only limit the URL to 200 characters', () => {
      const app = {
        url: 'https://test.com/' + 'a'.repeat(180),
        name: 'Test name',
      } as SafeAppData

      const result = getTxOrigin(app)

      expect(result?.length).toBe(200)

      expect(result).toBe(
        '{"url":"https://test.com/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","name":""}',
      )
    })
  })
})
