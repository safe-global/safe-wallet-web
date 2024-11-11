import {
  Cancellation,
  ConflictHeader,
  ConflictType,
  Creation,
  Custom,
  DateLabel,
  DetailedExecutionInfo,
  Erc20Transfer,
  Erc721Transfer,
  ExecutionInfo,
  Label,
  ModuleExecutionInfo,
  MultiSend,
  MultisigExecutionInfo,
  NativeCoinTransfer,
  Order,
  SettingsChange,
  SwapOrder,
  Transaction,
  TransactionInfo,
  TransactionInfoType,
  TransactionListItem,
  TransactionListItemType,
  TransactionStatus,
  TransactionTokenType,
  Transfer,
  TransferDirection,
  TransferInfo,
  TwapOrder,
} from '@safe-global/safe-gateway-typescript-sdk'
import uniq from 'lodash/uniq'

export const isTxQueued = (value: TransactionStatus): boolean => {
  return [TransactionStatus.AWAITING_CONFIRMATIONS, TransactionStatus.AWAITING_EXECUTION].includes(value)
}

export const getBulkGroupTxHash = (group: Transaction[]) => {
  const hashList = group.map((item) => item.transaction.txHash)
  return uniq(hashList).length === 1 ? hashList[0] : undefined
}

export const getTxHash = (item: Transaction): string => item.transaction.txHash as unknown as string

export const isTransferTxInfo = (value: TransactionInfo): value is Transfer => {
  return value.type === TransactionInfoType.TRANSFER || isSwapTransferOrderTxInfo(value)
}

export const isSettingsChangeTxInfo = (value: TransactionInfo): value is SettingsChange => {
  return value.type === TransactionInfoType.SETTINGS_CHANGE
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

export const isOrderTxInfo = (value: TransactionInfo): value is Order => {
  return isSwapOrderTxInfo(value) || isTwapOrderTxInfo(value)
}

export const isTwapOrderTxInfo = (value: TransactionInfo): value is TwapOrder => {
  return value.type === TransactionInfoType.TWAP_ORDER
}
export const isCancellationTxInfo = (value: TransactionInfo): value is Cancellation => {
  return isCustomTxInfo(value) && value.isCancellation
}

export const isTransactionListItem = (value: TransactionListItem): value is Transaction => {
  return value.type === TransactionListItemType.TRANSACTION
}

export const isConflictHeaderListItem = (value: TransactionListItem): value is ConflictHeader => {
  return value.type === TransactionListItemType.CONFLICT_HEADER
}

export const isNoneConflictType = (transaction: Transaction) => {
  return transaction.conflictType === ConflictType.NONE
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

export const isNativeTokenTransfer = (value: TransferInfo): value is NativeCoinTransfer => {
  return value.type === TransactionTokenType.NATIVE_COIN
}

export const isERC20Transfer = (value: TransferInfo): value is Erc20Transfer => {
  return value.type === TransactionTokenType.ERC20
}

export const isERC721Transfer = (value: TransferInfo): value is Erc721Transfer => {
  return value.type === TransactionTokenType.ERC721
}
