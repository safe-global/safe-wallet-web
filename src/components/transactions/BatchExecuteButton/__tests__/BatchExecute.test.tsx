import { getBatchableTransactions } from '@/components/transactions/BatchExecuteButton'

describe('getBatchableTransactions', () => {
  it('should return an empty array if no transactions are passed', () => {
    const result = getBatchableTransactions([], 0)

    expect(result).toStrictEqual([])
  })

  it.todo('should include a tx with enough confirmations')
  it.todo('should ignore a tx with missing confirmations')
  it.todo('should pick the newer tx of a group')
  it.todo('should ignore a tx with out of order nonce')
  it.todo('should return a maximum of 10 txs')
})
