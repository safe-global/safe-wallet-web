import {
  Cancellation,
  Creation,
  Custom,
  DateLabel,
  DetailedExecutionInfo,
  ExecutionInfo,
  Label,
  ModuleExecutionInfo,
  MultiSend,
  MultisigExecutionInfo,
  SwapOrder,
  Transaction,
  TransactionInfo,
  TransactionInfoType,
  TransactionListItem,
  TransactionListItemType,
  TransactionStatus,
  Transfer,
  TransferDirection,
} from '@safe-global/safe-gateway-typescript-sdk'

export const isTxQueued = (value: TransactionStatus): boolean => {
  return [TransactionStatus.AWAITING_CONFIRMATIONS, TransactionStatus.AWAITING_EXECUTION].includes(value)
}

export const isTransferTxInfo = (value: TransactionInfo): value is Transfer => {
  return value.type === TransactionInfoType.TRANSFER || isSwapTransferOrderTxInfo(value)
}

/**
 * A fulfillment transaction for swap, limit or twap order is always a SwapOrder
 * It cannot be a TWAP order
 *
 * @param value
 */
export const isSwapTransferOrderTxInfo = (value: TransactionInfo): value is SwapOrder => {
  return value.type === TransactionInfoType.SWAP_TRANSFER
}

export const isOutgoingTransfer = (txInfo: TransactionInfo): boolean => {
  return isTransferTxInfo(txInfo) && txInfo.direction.toUpperCase() === TransferDirection.OUTGOING
}

export const isCustomTxInfo = (value: TransactionInfo): value is Custom => {
  return value.type === TransactionInfoType.CUSTOM
}

export const isMultiSendTxInfo = (value: TransactionInfo): value is MultiSend => {
  return (
    value.type === TransactionInfoType.CUSTOM &&
    value.methodName === 'multiSend' &&
    typeof value.actionCount === 'number'
  )
}
export const isCancellationTxInfo = (value: TransactionInfo): value is Cancellation => {
  return isCustomTxInfo(value) && value.isCancellation
}

export const isTransactionListItem = (value: TransactionListItem): value is Transaction => {
  return value.type === TransactionListItemType.TRANSACTION
}

export const isDateLabel = (value: TransactionListItem): value is DateLabel => {
  return value.type === TransactionListItemType.DATE_LABEL
}

export const isLabelListItem = (value: TransactionListItem): value is Label => {
  return value.type === TransactionListItemType.LABEL
}

export const isCreationTxInfo = (value: TransactionInfo): value is Creation => {
  return value.type === TransactionInfoType.CREATION
}

export const isMultisigExecutionInfo = (
  value?: ExecutionInfo | DetailedExecutionInfo,
): value is MultisigExecutionInfo => {
  return value?.type === 'MULTISIG'
}

export const isModuleExecutionInfo = (value?: ExecutionInfo | DetailedExecutionInfo): value is ModuleExecutionInfo =>
  value?.type === 'MODULE'

export const isSwapOrderTxInfo = (value: TransactionInfo): value is SwapOrder => {
  return value.type === TransactionInfoType.SWAP_ORDER
}
