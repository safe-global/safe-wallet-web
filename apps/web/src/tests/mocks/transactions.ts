import {
  type AddressEx,
  ConflictType,
  DetailedExecutionInfoType,
  type MultisigExecutionInfo,
  type Transaction,
  type TransactionInfo,
  TransactionInfoType,
  TransactionListItemType,
  TransactionStatus,
  type TransactionSummary,
  TransactionTokenType,
  TransferDirection,
  type TransferInfo,
} from '@safe-global/safe-gateway-typescript-sdk'

const mockAddressEx: AddressEx = {
  value: 'string',
}

const mockTransferInfo: TransferInfo = {
  type: TransactionTokenType.ERC20,
  tokenAddress: 'string',
  value: 'string',
  trusted: true,
  imitation: false,
}

const mockTxInfo: TransactionInfo = {
  type: TransactionInfoType.TRANSFER,
  sender: mockAddressEx,
  recipient: mockAddressEx,
  direction: TransferDirection.OUTGOING,
  transferInfo: mockTransferInfo,
}

export const defaultTx: TransactionSummary = {
  id: '',
  timestamp: 0,
  txInfo: mockTxInfo,
  txStatus: TransactionStatus.AWAITING_CONFIRMATIONS,
  executionInfo: {
    type: DetailedExecutionInfoType.MULTISIG,
    nonce: 1,
    confirmationsRequired: 2,
    confirmationsSubmitted: 2,
  },
  txHash: null,
}

export const getMockTx = ({ nonce }: { nonce?: number }): Transaction => {
  return {
    transaction: {
      ...defaultTx,
      executionInfo: {
        ...defaultTx.executionInfo,
        nonce: nonce ?? (defaultTx.executionInfo as MultisigExecutionInfo).nonce,
      } as MultisigExecutionInfo,
    },
    type: TransactionListItemType.TRANSACTION,
    conflictType: ConflictType.NONE,
  }
}
