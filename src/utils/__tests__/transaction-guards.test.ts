import { TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import { isNextTx } from '../transaction-guards'

describe('transaction-guards', () => {
  describe('isNextTx', () => {
    it('returns true if the first transaction is the next one', () => {
      const txId = 'id123'

      const items = [
        {
          type: 'LABEL',
          label: 'Next',
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: txId,
          },
        },
      ] as TransactionListItem[]

      expect(isNextTx(txId, items)).toBe(true)
    })
    it('returns false if the first transaction is not the next one', () => {
      const txId = 'id456'

      const items = [
        {
          type: 'LABEL',
          label: 'Next',
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: '0x1',
          },
        },

        {
          type: 'LABEL',
          label: 'Queue',
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: txId,
          },
        },
      ] as TransactionListItem[]

      expect(isNextTx(txId, items)).toBe(false)
    })
  })
})
