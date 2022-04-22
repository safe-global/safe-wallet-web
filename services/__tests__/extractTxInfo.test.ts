import type { TransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import extractTxInfo from '../extractTxInfo'

describe('extractTxInfo', () => {
  it('should extract tx info for an ETH transfer', () => {
    const txSummary = {
      txInfo: {
        type: 'Transfer',
        transferInfo: {
          type: 'NATIVE_COIN',
          value: '1000000000000000000',
        },
        recipient: {
          value: '0x1234567890123456789012345678901234567890',
        },
      },
      executionInfo: {
        nonce: '0',
      },
    } as unknown as TransactionSummary

    const txDetails = {
      txData: {
        operation: 'CALL',
        value: '1000000000000000000',
        data: '0x1234567890123456789012345678901234567890',
      },
      detailedExecutionInfo: {
        baseGas: 21000,
        gasPrice: '10000000000',
        safeTxGas: 11000,
        gasToken: '0x0000000000000000000000000000000000000000',

        refundReceiver: {
          type: 'Address',
          value: '0x1234567890123456789012345678901234567890',
        },
        confirmations: [{ signer: { value: '0x1234567890123456789012345678901234567890' }, signature: '0x123' }],
      },
    } as unknown as TransactionDetails

    expect(extractTxInfo(txSummary, txDetails)).toEqual({
      txParams: {
        data: '0x',
        baseGas: 21000,
        gasPrice: 10000000000,
        safeTxGas: 11000,
        gasToken: '0x0000000000000000000000000000000000000000',
        nonce: '0',
        refundReceiver: '0x1234567890123456789012345678901234567890',
        value: '1000000000000000000',
        to: '0x1234567890123456789012345678901234567890',
        operation: 'CALL',
      },
      signatures: {
        '0x1234567890123456789012345678901234567890': '0x123',
      },
    })
  })

  it('should extract tx info for an ERC20 token transfer', () => {
    const txSummary = {
      txInfo: {
        type: 'Transfer',
        transferInfo: {
          type: 'ERC20',
          value: '1000000000000000000',
          tokenAddress: '0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
        },
        recipient: {
          value: '0x1234567890123456789012345678901234567890',
        },
      },
      executionInfo: {
        nonce: '0',
      },
    } as unknown as TransactionSummary

    const txDetails = {
      txData: {
        operation: 'CALL',
        value: '0x0',
        hexData: '0x546785',
        data: '0x1234567890123456789012345678901234567890',
      },
      detailedExecutionInfo: {
        baseGas: 21000,
        gasPrice: '10000000000',
        safeTxGas: 11000,
        gasToken: '0x0000000000000000000000000000000000000000',

        refundReceiver: {
          type: 'Address',
          value: '0x1234567890123456789012345678901234567890',
        },
        confirmations: [{ signer: { value: '0x1234567890123456789012345678901234567890' }, signature: '0x123' }],
      },
    } as unknown as TransactionDetails

    expect(extractTxInfo(txSummary, txDetails)).toEqual({
      txParams: {
        data: '0x546785',
        baseGas: 21000,
        gasPrice: 10000000000,
        safeTxGas: 11000,
        gasToken: '0x0000000000000000000000000000000000000000',
        nonce: '0',
        refundReceiver: '0x1234567890123456789012345678901234567890',
        value: '0x0',
        to: '0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
        operation: 'CALL',
      },
      signatures: {
        '0x1234567890123456789012345678901234567890': '0x123',
      },
    })
  })
})
