import type {
  AddressEx,
  Cancellation,
  ConflictHeader,
  Creation,
  Custom,
  DateLabel,
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
  SafeInfo,
  SettingsChange,
  Transaction,
  TransactionInfo,
  TransactionListItem,
  TransactionSummary,
  Transfer,
  TransferInfo,
} from '@safe-global/safe-gateway-typescript-sdk'
import { TransferDirection } from '@safe-global/safe-gateway-typescript-sdk'
import {
  ConflictType,
  DetailedExecutionInfoType,
  TransactionInfoType,
  TransactionListItemType,
  TransactionStatus,
  TransactionTokenType,
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
  return value.type === TransactionInfoType.TRANSFER
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
