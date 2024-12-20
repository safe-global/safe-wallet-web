import {
  DetailedExecutionInfoType,
  ExecutionInfo,
  TransactionInfoType,
  TransactionListItemType,
  TransactionStatus,
  TransferDirection,
} from '@safe-global/store/gateway/types'
import {
  isCancellationTxInfo,
  isCreationTxInfo,
  isCustomTxInfo,
  isDateLabel,
  isLabelListItem,
  isModuleExecutionInfo,
  isMultiSendTxInfo,
  isMultisigExecutionInfo,
  isOutgoingTransfer,
  isSwapOrderTxInfo,
  isTransactionListItem,
  isTransferTxInfo,
  isTxQueued,
} from './transaction-guards'
import { mockERC20Transfer, mockListItemByType, mockSwapTransfer, mockTransferWithInfo } from '../tests/mocks'

const multisigTx: ExecutionInfo = {
  type: DetailedExecutionInfoType.MULTISIG,
  nonce: 1,
  confirmationsRequired: 2,
  confirmationsSubmitted: 1,
  missingSigners: [
    {
      value: '0x000000',
      name: 'alice',
    },
    {
      value: '0x00asd0',
      name: 'bob',
    },
  ],
}

const moduleTx: ExecutionInfo = {
  type: DetailedExecutionInfoType.MODULE,
  address: {
    value: '0x000000',
    name: 'alice',
  },
}

describe('Transaction Guards', () => {
  it('should check if isTxQueued', () => {
    expect(isTxQueued(TransactionStatus.AWAITING_CONFIRMATIONS)).toBe(true)
    expect(isTxQueued(TransactionStatus.AWAITING_EXECUTION)).toBe(true)
    expect(isTxQueued(TransactionStatus.CANCELLED)).toBe(false)
  })

  it('should check a txInfo transfer', () => {
    expect(isTransferTxInfo(mockERC20Transfer)).toBe(true)
    expect(isTransferTxInfo(mockSwapTransfer)).toBe(true)
  })

  it('should check an outGoing transfer', () => {
    const incomingTx = mockTransferWithInfo({
      direction: TransferDirection.INCOMING,
    })
    const outGoingTx = mockTransferWithInfo({
      direction: TransferDirection.OUTGOING,
    })

    expect(isOutgoingTransfer(outGoingTx)).toBe(true)
    expect(isOutgoingTransfer(incomingTx)).toBe(false)
  })

  it('should check if a transaction is a custom transaction', () => {
    const customTx = mockTransferWithInfo({
      type: TransactionInfoType.CUSTOM,
    })
    const swapTx = mockTransferWithInfo({
      type: TransactionInfoType.SWAP_ORDER,
    })

    expect(isCustomTxInfo(customTx)).toBe(true)
    expect(isCustomTxInfo(swapTx)).toBe(false)
  })

  it('should check if a transaction is a multi send transaction', () => {
    const multiSend = mockTransferWithInfo({
      type: TransactionInfoType.CUSTOM,
      methodName: 'multiSend',
      actionCount: 2,
    })
    const swapTx = mockTransferWithInfo({
      type: TransactionInfoType.SWAP_ORDER,
    })

    expect(isMultiSendTxInfo(multiSend)).toBe(true)
    expect(isMultiSendTxInfo(swapTx)).toBe(false)
  })

  it('should check if it is possible to cancel a transaction', () => {
    const multiSend = mockTransferWithInfo({
      type: TransactionInfoType.CUSTOM,
      methodName: 'multiSend',
      actionCount: 2,
      isCancellation: true,
    })
    const customTx = mockTransferWithInfo({
      type: TransactionInfoType.CUSTOM,
    })

    expect(isCancellationTxInfo(multiSend)).toBe(true)
    expect(isCancellationTxInfo(customTx)).toBeFalsy()
  })

  it('should check if it is a transaction list item', () => {
    expect(isTransactionListItem(mockListItemByType(TransactionListItemType.TRANSACTION))).toBe(true)
    expect(isTransactionListItem(mockListItemByType(TransactionListItemType.DATE_LABEL))).toBe(false)
    expect(isTransactionListItem(mockListItemByType(TransactionListItemType.LABEL))).toBe(false)
  })

  it('should check if it is a DateLabel transaction', () => {
    expect(isDateLabel(mockListItemByType(TransactionListItemType.TRANSACTION))).toBe(false)
    expect(isDateLabel(mockListItemByType(TransactionListItemType.DATE_LABEL))).toBe(true)
    expect(isDateLabel(mockListItemByType(TransactionListItemType.LABEL))).toBe(false)
  })

  it('should check if it is a Label list item', () => {
    expect(isLabelListItem(mockListItemByType(TransactionListItemType.TRANSACTION))).toBe(false)
    expect(isLabelListItem(mockListItemByType(TransactionListItemType.DATE_LABEL))).toBe(false)
    expect(isLabelListItem(mockListItemByType(TransactionListItemType.LABEL))).toBe(true)
  })

  it('should check if it is a creation transaction type', () => {
    expect(isCreationTxInfo(mockTransferWithInfo({ type: TransactionInfoType.CREATION }))).toBe(true)
    expect(isCreationTxInfo(mockTransferWithInfo({ type: TransactionInfoType.CUSTOM }))).toBe(false)
  })

  it('should check if it is a multisig execution', () => {
    expect(isMultisigExecutionInfo(multisigTx)).toBe(true)
    expect(isMultisigExecutionInfo(moduleTx)).toBe(false)
  })

  it('should check if it is a multisig execution', () => {
    expect(isModuleExecutionInfo(moduleTx)).toBe(true)
    expect(isModuleExecutionInfo(multisigTx)).toBe(false)
  })

  it('should check if it is a swap order', () => {
    expect(isSwapOrderTxInfo(mockTransferWithInfo({ type: TransactionInfoType.SWAP_ORDER }))).toBe(true)
    expect(isSwapOrderTxInfo(mockTransferWithInfo({ type: TransactionInfoType.CUSTOM }))).toBe(false)
  })
})
