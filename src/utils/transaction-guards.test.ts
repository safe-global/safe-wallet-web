import { TransactionStatus } from '@safe-global/safe-gateway-typescript-sdk'
import { isTxQueued } from './transaction-guards'

describe('Transaction Guards', () => {
  it('should check if isTxQueued', () => {
    expect(isTxQueued(TransactionStatus.AWAITING_CONFIRMATIONS)).toBe(true)
    expect(isTxQueued(TransactionStatus.AWAITING_EXECUTION)).toBe(true)
    expect(isTxQueued(TransactionStatus.CANCELLED)).toBe(false)
  })
})
