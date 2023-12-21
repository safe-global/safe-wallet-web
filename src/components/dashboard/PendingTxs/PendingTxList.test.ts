import { faker } from '@faker-js/faker'
import type { Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import { safeInfoBuilder } from '@/tests/builders/safe'
import { _getTransactionsToDisplay } from './PendingTxsList'

describe('_getTransactionsToDisplay', () => {
  it('should return the queue sliced by max txs', () => {
    const walletAddress = faker.finance.ethereumAddress()
    const safe = safeInfoBuilder().build()
    const queue = [
      { transaction: { id: '1' } },
      { transaction: { id: '2' } },
      { transaction: { id: '3' } },
      { transaction: { id: '4' } },
    ] as Array<Transaction>

    const result = _getTransactionsToDisplay(queue, walletAddress, safe, 3)
    expect(result).toEqual(queue.slice(0, 3))
  })
})
