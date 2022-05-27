import { TransactionListItem, TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import { formatTxSlicePayload, _hasInitialDateLabel } from '../txSliceUtils'

describe('txSliceUtils', () => {
  describe('hasInitialDateLabel', () => {
    it('should return false if the first item is not a DateLabel and the second item is a Transaction', () => {
      const results = [
        {
          type: 'TRANSACTION',
        },
        {
          type: 'DATE_LABEL',
        },
      ] as TransactionListItem[]

      expect(_hasInitialDateLabel(results)).toBe(false)
    })
    it('should return true if the first item is a DateLabel and the second item is a Transaction', () => {
      const results = [
        {
          type: 'DATE_LABEL',
        },
        {
          type: 'TRANSACTION',
        },
      ] as TransactionListItem[]

      expect(_hasInitialDateLabel(results)).toBe(true)
    })
  })
  describe('formatTxSlicePayload', () => {
    it('should return the payload if the first item is a DateLabel and the second item is a Transaction', () => {
      const payload = {
        results: [
          {
            type: 'DATE_LABEL',
          },
          {
            type: 'TRANSACTION',
          },
        ],
      } as TransactionListPage

      expect(formatTxSlicePayload(payload)).toStrictEqual(payload)
    })
    it('should prepend a DateLabel if the first item is a Transaction', () => {
      const payload = {
        results: [
          {
            type: 'TRANSACTION',
            transaction: {
              timestamp: 123,
            },
          },
        ],
      } as TransactionListPage

      const formattedPayload = {
        ...payload,
        results: [
          {
            type: 'DATE_LABEL',
            timestamp: 123,
          },
          ...payload.results,
        ],
      }

      expect(formatTxSlicePayload(payload)).toStrictEqual(formattedPayload)
    })
  })
})
