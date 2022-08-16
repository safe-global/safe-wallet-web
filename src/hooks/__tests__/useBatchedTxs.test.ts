import {
  AddressEx,
  MultisigExecutionInfo,
  Transaction,
  TransactionInfo,
  TransactionStatus,
  TransactionSummary,
  TransactionTokenType,
  TransferDirection,
  TransferInfo,
} from '@gnosis.pm/safe-react-gateway-sdk'
import { getBatchableTransactions } from '@/hooks/useBatchedTxs'

const mockAddressEx: AddressEx = {
  value: 'string',
}

const mockTransferInfo: TransferInfo = {
  type: TransactionTokenType.ERC20,
  tokenAddress: 'string',
  value: 'string',
}

const mockTxInfo: TransactionInfo = {
  type: 'Transfer',
  sender: mockAddressEx,
  recipient: mockAddressEx,
  direction: TransferDirection.OUTGOING,
  transferInfo: mockTransferInfo,
}

const defaultTx: TransactionSummary = {
  id: '',
  timestamp: 0,
  txInfo: mockTxInfo,
  txStatus: TransactionStatus.AWAITING_CONFIRMATIONS,
  executionInfo: {
    type: 'MULTISIG',
    nonce: 1,
    confirmationsRequired: 2,
    confirmationsSubmitted: 2,
  },
}

const getMockTx = ({ nonce }: { nonce?: number }): Transaction => {
  return {
    transaction: {
      ...defaultTx,
      executionInfo: {
        ...defaultTx.executionInfo,
        nonce: nonce ?? (defaultTx.executionInfo as MultisigExecutionInfo).nonce,
      } as MultisigExecutionInfo,
    },
    type: 'TRANSACTION',
    conflictType: 'None',
  }
}

describe('getBatchableTransactions', () => {
  it('should return an empty array if no transactions are passed', () => {
    const result = getBatchableTransactions([], 0)

    expect(result).toStrictEqual([])
  })

  it('should include a tx with enough confirmations', () => {
    const mockTx: Transaction = {
      transaction: {
        ...defaultTx,
        executionInfo: {
          ...defaultTx.executionInfo,
          nonce: 0,
          confirmationsRequired: 2,
          confirmationsSubmitted: 2,
        } as MultisigExecutionInfo,
      },
      type: 'TRANSACTION',
      conflictType: 'None',
    }
    const result = getBatchableTransactions([mockTx], 0)

    expect(result.length).toBe(1)
    expect(result).toStrictEqual([mockTx])
  })

  it('should ignore a tx with missing confirmations', () => {
    const mockTx: Transaction = {
      transaction: {
        ...defaultTx,
        executionInfo: {
          ...defaultTx.executionInfo,
          nonce: 0,
          confirmationsRequired: 2,
          confirmationsSubmitted: 1,
        } as MultisigExecutionInfo,
      },
      type: 'TRANSACTION',
      conflictType: 'None',
    }
    const result = getBatchableTransactions([mockTx], 0)

    expect(result.length).toBe(0)
    expect(result).toStrictEqual([])
  })

  it('should pick the newer tx of a group', () => {
    const mockTx: Transaction = {
      transaction: {
        ...defaultTx,
        executionInfo: {
          ...defaultTx.executionInfo,
          nonce: 0,
          confirmationsRequired: 2,
          confirmationsSubmitted: 2,
        } as MultisigExecutionInfo,
      },
      type: 'TRANSACTION',
      conflictType: 'None',
    }

    const mockTx1: Transaction = {
      transaction: {
        ...defaultTx,
        executionInfo: {
          ...defaultTx.executionInfo,
          nonce: 1,
          confirmationsRequired: 2,
          confirmationsSubmitted: 2,
        } as MultisigExecutionInfo,
        timestamp: 1,
      },
      type: 'TRANSACTION',
      conflictType: 'None',
    }

    const mockTx2: Transaction = {
      transaction: {
        ...defaultTx,
        executionInfo: {
          ...defaultTx.executionInfo,
          nonce: 1,
          confirmationsRequired: 2,
          confirmationsSubmitted: 2,
        } as MultisigExecutionInfo,
        timestamp: 2,
      },
      type: 'TRANSACTION',
      conflictType: 'None',
    }

    const result = getBatchableTransactions([mockTx, [mockTx1, mockTx2]], 0)

    expect(result.length).toBe(2)
    expect(result).toStrictEqual([mockTx, mockTx2])
  })

  it('should ignore a tx with out of order nonce', () => {
    const mockTx: Transaction = {
      transaction: {
        ...defaultTx,
        executionInfo: {
          ...defaultTx.executionInfo,
          nonce: 0,
          confirmationsRequired: 2,
          confirmationsSubmitted: 2,
        } as MultisigExecutionInfo,
      },
      type: 'TRANSACTION',
      conflictType: 'None',
    }

    const mockTx1: Transaction = {
      transaction: {
        ...defaultTx,
        executionInfo: {
          ...defaultTx.executionInfo,
          nonce: 2,
          confirmationsRequired: 2,
          confirmationsSubmitted: 2,
        } as MultisigExecutionInfo,
      },
      type: 'TRANSACTION',
      conflictType: 'None',
    }

    const result = getBatchableTransactions([mockTx, mockTx1], 0)

    expect(result.length).toBe(1)
    expect(result).toStrictEqual([mockTx])
  })

  it('should return a maximum of 10 txs', () => {
    const mockTx: Transaction = getMockTx({ nonce: 0 })
    const mockTx1 = getMockTx({ nonce: 1 })
    const mockTx2 = getMockTx({ nonce: 2 })
    const mockTx3 = getMockTx({ nonce: 3 })
    const mockTx4 = getMockTx({ nonce: 4 })
    const mockTx5 = getMockTx({ nonce: 5 })
    const mockTx6 = getMockTx({ nonce: 6 })
    const mockTx7 = getMockTx({ nonce: 7 })
    const mockTx8 = getMockTx({ nonce: 8 })
    const mockTx9 = getMockTx({ nonce: 9 })
    const mockTx10 = getMockTx({ nonce: 10 })

    const result = getBatchableTransactions(
      [mockTx, mockTx1, mockTx2, mockTx3, mockTx4, mockTx5, mockTx6, mockTx7, mockTx8, mockTx9, mockTx10],
      0,
    )

    expect(result.length).toBe(10)
    expect(result).toStrictEqual([
      mockTx,
      mockTx1,
      mockTx2,
      mockTx3,
      mockTx4,
      mockTx5,
      mockTx6,
      mockTx7,
      mockTx8,
      mockTx9,
    ])
  })
})
