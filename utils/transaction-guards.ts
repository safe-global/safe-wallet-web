import {
  AddressEx,
  Cancellation,
  ConflictHeader,
  Creation,
  Custom,
  DateLabel,
  DetailedExecutionInfo,
  Label,
  ModuleExecutionInfo,
  MultiSend,
  MultisigExecutionDetails,
  MultisigExecutionInfo,
  SettingsChange,
  Transaction,
  TransactionInfo,
  TransactionListItem,
  TransactionStatus,
  TransactionSummary,
  Transfer,
} from '@gnosis.pm/safe-react-gateway-sdk'

export const isTxQueued = (value: TransactionStatus): boolean => {
  return [
    TransactionStatus.AWAITING_CONFIRMATIONS,
    TransactionStatus.AWAITING_EXECUTION,
    TransactionStatus.WILL_BE_REPLACED,
  ].includes(value)
}

export const isAwaitingExecution = (txStatus: TransactionStatus): boolean =>
  TransactionStatus.AWAITING_EXECUTION === txStatus

export const isOwner = (safeOwners: AddressEx[] | undefined, walletAddress: string | undefined) => {
  return safeOwners?.some((owner) => owner.value.toLowerCase() === walletAddress?.toLowerCase())
}

export const isMultisigExecutionDetails = (value: DetailedExecutionInfo | null): value is MultisigExecutionDetails => {
  return value?.type === 'MULTISIG'
}

// TODO: replace this type guard for the one guard above
export const isMultisigExecutionInfo = (value: TransactionSummary['executionInfo']): value is MultisigExecutionInfo =>
  value?.type === 'MULTISIG'

export const isModuleExecutionInfo = (value: TransactionSummary['executionInfo']): value is ModuleExecutionInfo =>
  value?.type === 'MODULE'

export const isTransaction = (value: TransactionListItem): value is Transaction => {
  return value.type === 'TRANSACTION'
}

// TransactionInfo type guards
// TODO: could be passed to Client GW SDK
enum TransactionInfoType {
  TRANSFER = 'Transfer',
  SETTINGS_CHANGE = 'SettingsChange',
  CUSTOM = 'Custom',
  CREATION = 'Creation',
}

export const isTransferTxInfo = (value: TransactionInfo): value is Transfer => {
  return value.type === TransactionInfoType.TRANSFER
}

export const isSettingsChangeTxInfo = (value: TransactionInfo): value is SettingsChange => {
  return value.type === TransactionInfoType.SETTINGS_CHANGE
}

export const isCustomTxInfo = (value: TransactionInfo): value is Custom => {
  return value.type === TransactionInfoType.CUSTOM
}

export const isMultisendTxInfo = (value: TransactionInfo): value is MultiSend => {
  return value.type === TransactionInfoType.CUSTOM && value.methodName === 'multiSend'
}

export const isCancellationTxInfo = (value: TransactionInfo): value is Cancellation => {
  return isCustomTxInfo(value) && value.isCancellation
}

export const isCreationTxInfo = (value: TransactionInfo): value is Creation => {
  return value.type === TransactionInfoType.CREATION
}

// TxListItem type guards
// TODO: could be passed to Client GW SDK
enum TransactionListItemType {
  TRANSACTION = 'TRANSACTION',
  LABEL = 'LABEL',
  CONFLICT_HEADER = 'CONFLICT_HEADER',
  DATE_LABEL = 'DATE_LABEL',
}
export const isTransactionListItem = (value: TransactionListItem): value is Transaction => {
  return value.type === TransactionListItemType.TRANSACTION
}

export const isLabelListItem = (value: TransactionListItem): value is Label => {
  return value.type === TransactionListItemType.LABEL
}

export const isConflictHeaderListItem = (value: TransactionListItem): value is ConflictHeader => {
  return value.type === TransactionListItemType.CONFLICT_HEADER
}

export const isDateLabel = (value: TransactionListItem): value is DateLabel => {
  return value.type === TransactionListItemType.DATE_LABEL
}

export const isSignableBy = (txSummary: TransactionSummary, walletAddress: string): boolean => {
  const executionInfo = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo : undefined
  return !!executionInfo?.missingSigners?.some((address) => address.value === walletAddress)
}

export const isExecutable = (txSummary: TransactionSummary, walletAddress: string): boolean => {
  if (!txSummary.executionInfo || !isMultisigExecutionInfo(txSummary.executionInfo)) {
    return false
  }
  const { confirmationsRequired, confirmationsSubmitted } = txSummary.executionInfo
  return (
    confirmationsSubmitted >= confirmationsRequired ||
    (confirmationsSubmitted === confirmationsRequired - 1 && isSignableBy(txSummary, walletAddress))
  )
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
