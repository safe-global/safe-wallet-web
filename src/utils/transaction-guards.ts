import type {
  AddressEx,
  BaselineConfirmationView,
  Cancellation,
  ConflictHeader,
  Creation,
  Custom,
  DateLabel,
  DecodedDataResponse,
  DetailedExecutionInfo,
  Erc20Transfer,
  Erc721Transfer,
  ExecutionInfo,
  Label,
  ModuleExecutionDetails,
  ModuleExecutionInfo,
  MultiSend,
  MultisigExecutionDetails,
  MultisigExecutionInfo,
  NativeCoinTransfer,
  Order,
  OrderConfirmationView,
  SafeInfo,
  SettingsChange,
  SwapOrder,
  SwapOrderConfirmationView,
  Transaction,
  TransactionInfo,
  TransactionListItem,
  TransactionSummary,
  Transfer,
  TransferInfo,
  TwapOrder,
  TwapOrderConfirmationView,
} from '@safe-global/safe-gateway-typescript-sdk'
import {
  ConfirmationViewTypes,
  ConflictType,
  DetailedExecutionInfoType,
  TransactionInfoType,
  TransactionListItemType,
  TransactionStatus,
  TransactionTokenType,
  TransferDirection,
} from '@safe-global/safe-gateway-typescript-sdk'
import { getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import { sameAddress } from '@/utils/addresses'
import type { NamedAddress } from '@/components/new-safe/create/types'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'
import { ethers } from 'ethers'

export const isTxQueued = (value: TransactionStatus): boolean => {
  return [TransactionStatus.AWAITING_CONFIRMATIONS, TransactionStatus.AWAITING_EXECUTION].includes(value)
}

export const isAwaitingExecution = (txStatus: TransactionStatus): boolean =>
  TransactionStatus.AWAITING_EXECUTION === txStatus

const isAddressEx = (owners: AddressEx[] | NamedAddress[]): owners is AddressEx[] => {
  return (owners as AddressEx[]).every((owner) => owner.value !== undefined)
}

export const isOwner = (safeOwners: AddressEx[] | NamedAddress[] = [], walletAddress?: string) => {
  if (isAddressEx(safeOwners)) {
    return safeOwners.some((owner) => sameAddress(owner.value, walletAddress))
  }

  return safeOwners.some((owner) => sameAddress(owner.address, walletAddress))
}

export const isMultisigDetailedExecutionInfo = (value?: DetailedExecutionInfo): value is MultisigExecutionDetails => {
  return value?.type === DetailedExecutionInfoType.MULTISIG
}

export const isModuleDetailedExecutionInfo = (value?: DetailedExecutionInfo): value is ModuleExecutionDetails => {
  return value?.type === DetailedExecutionInfoType.MODULE
}

// TransactionInfo type guards
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

export const isSettingsChangeTxInfo = (value: TransactionInfo): value is SettingsChange => {
  return value.type === TransactionInfoType.SETTINGS_CHANGE
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

export const isSwapOrderTxInfo = (value: TransactionInfo): value is SwapOrder => {
  return value.type === TransactionInfoType.SWAP_ORDER
}

export const isTwapOrderTxInfo = (value: TransactionInfo): value is TwapOrder => {
  return value.type === TransactionInfoType.TWAP_ORDER
}

export const isConfirmationViewOrder = (
  decodedData: DecodedDataResponse | BaselineConfirmationView | OrderConfirmationView | undefined,
): decodedData is OrderConfirmationView => {
  return isSwapConfirmationViewOrder(decodedData) || isTwapConfirmationViewOrder(decodedData)
}

export const isTwapConfirmationViewOrder = (
  decodedData: DecodedDataResponse | BaselineConfirmationView | OrderConfirmationView | undefined,
): decodedData is TwapOrderConfirmationView => {
  if (decodedData && 'type' in decodedData) {
    return decodedData.type === ConfirmationViewTypes.COW_SWAP_TWAP_ORDER
  }

  return false
}

export const isSwapConfirmationViewOrder = (
  decodedData: DecodedDataResponse | BaselineConfirmationView | OrderConfirmationView | undefined,
): decodedData is SwapOrderConfirmationView => {
  if (decodedData && 'type' in decodedData) {
    return decodedData.type === ConfirmationViewTypes.COW_SWAP_ORDER
  }

  return false
}

export const isCancelledSwapOrder = (value: TransactionInfo) => {
  return isSwapOrderTxInfo(value) && value.status === 'cancelled'
}

export const isOpenSwapOrder = (value: TransactionInfo) => {
  return isSwapOrderTxInfo(value) && value.status === 'open'
}

export const isCancellationTxInfo = (value: TransactionInfo): value is Cancellation => {
  return isCustomTxInfo(value) && value.isCancellation
}

export const isCreationTxInfo = (value: TransactionInfo): value is Creation => {
  return value.type === TransactionInfoType.CREATION
}

export const isOutgoingTransfer = (txInfo: TransactionInfo): boolean => {
  return isTransferTxInfo(txInfo) && txInfo.direction.toUpperCase() === TransferDirection.OUTGOING
}

export const isIncomingTransfer = (txInfo: TransactionInfo): boolean => {
  return isTransferTxInfo(txInfo) && txInfo.direction.toUpperCase() === TransferDirection.INCOMING
}

// TransactionListItem type guards
export const isLabelListItem = (value: TransactionListItem): value is Label => {
  return value.type === TransactionListItemType.LABEL
}

export const isConflictHeaderListItem = (value: TransactionListItem): value is ConflictHeader => {
  return value.type === TransactionListItemType.CONFLICT_HEADER
}

export const isDateLabel = (value: TransactionListItem): value is DateLabel => {
  return value.type === TransactionListItemType.DATE_LABEL
}

export const isTransactionListItem = (value: TransactionListItem): value is Transaction => {
  return value.type === TransactionListItemType.TRANSACTION
}

export function isRecoveryQueueItem(value: TransactionListItem | RecoveryQueueItem): value is RecoveryQueueItem {
  const EVENT_SIGNATURE = 'TransactionAdded(uint256,bytes32,address,uint256,bytes,uint8)'
  return 'fragment' in value && ethers.id(EVENT_SIGNATURE) === value.fragment.topicHash
}

// Narrows `Transaction`
export const isMultisigExecutionInfo = (value?: ExecutionInfo): value is MultisigExecutionInfo =>
  value?.type === DetailedExecutionInfoType.MULTISIG

export const isModuleExecutionInfo = (value?: ExecutionInfo): value is ModuleExecutionInfo =>
  value?.type === DetailedExecutionInfoType.MODULE

export const isSignableBy = (txSummary: TransactionSummary, walletAddress: string): boolean => {
  const executionInfo = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo : undefined
  return !!executionInfo?.missingSigners?.some((address) => address.value === walletAddress)
}

export const isConfirmableBy = (txSummary: TransactionSummary, walletAddress: string): boolean => {
  if (!txSummary.executionInfo || !isMultisigExecutionInfo(txSummary.executionInfo)) {
    return false
  }
  const { confirmationsRequired, confirmationsSubmitted } = txSummary.executionInfo
  return (
    confirmationsSubmitted >= confirmationsRequired ||
    (confirmationsSubmitted === confirmationsRequired - 1 && isSignableBy(txSummary, walletAddress))
  )
}

export const isExecutable = (txSummary: TransactionSummary, walletAddress: string, safe: SafeInfo): boolean => {
  if (
    !txSummary.executionInfo ||
    !isMultisigExecutionInfo(txSummary.executionInfo) ||
    safe.nonce !== txSummary.executionInfo.nonce
  ) {
    return false
  }
  return isConfirmableBy(txSummary, walletAddress)
}

// Spending limits
enum SPENDING_LIMIT_METHODS_NAMES {
  ADD_DELEGATE = 'addDelegate',
  SET_ALLOWANCE = 'setAllowance',
  EXECUTE_ALLOWANCE_TRANSFER = 'executeAllowanceTransfer',
  DELETE_ALLOWANCE = 'deleteAllowance',
}

export type SpendingLimitMethods = 'setAllowance' | 'deleteAllowance'

export const isSetAllowance = (method?: string): method is SpendingLimitMethods => {
  return method === SPENDING_LIMIT_METHODS_NAMES.SET_ALLOWANCE
}

export const isDeleteAllowance = (method?: string): method is SpendingLimitMethods => {
  return method === SPENDING_LIMIT_METHODS_NAMES.DELETE_ALLOWANCE
}

export const isSpendingLimitMethod = (method?: string): boolean => {
  return isSetAllowance(method) || isDeleteAllowance(method)
}

export const isSupportedSpendingLimitAddress = (txInfo: TransactionInfo, chainId: string): boolean => {
  const toAddress = isCustomTxInfo(txInfo) ? txInfo.to.value : ''
  const spendingLimitModuleAddress = getSpendingLimitModuleAddress(chainId)

  return sameAddress(spendingLimitModuleAddress, toAddress)
}

// Method parameter types
export const isArrayParameter = (parameter: string): boolean => /(\[\d*?])+$/.test(parameter)
export const isAddress = (type: string): boolean => type.indexOf('address') === 0
export const isByte = (type: string): boolean => type.indexOf('byte') === 0

export const isNoneConflictType = (transaction: Transaction) => {
  return transaction.conflictType === ConflictType.NONE
}
export const isHasNextConflictType = (transaction: Transaction) => {
  return transaction.conflictType === ConflictType.HAS_NEXT
}
export const isEndConflictType = (transaction: Transaction) => {
  return transaction.conflictType === ConflictType.END
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
