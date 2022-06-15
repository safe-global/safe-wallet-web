import {
  AddressEx,
  Custom,
  DateLabel,
  DetailedExecutionInfo,
  MultisigExecutionDetails,
  MultisigExecutionInfo,
  Transaction,
  TransactionInfo,
  TransactionListItem,
  TransactionStatus,
  TransactionSummary,
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

export const isMultisigExecutionInfo = (value: TransactionSummary['executionInfo']): value is MultisigExecutionInfo =>
  value?.type === 'MULTISIG'

export const isCustomTxInfo = (value: TransactionInfo): value is Custom => {
  return value.type === 'Custom'
}

export const isTransaction = (value: TransactionListItem): value is Transaction => {
  return value.type === 'TRANSACTION'
}

// @ts-expect-error @TODO: Add DateLabel to TransactionListItem type in SDK types
export const isDateLabel = (value: TransactionListItem): value is DateLabel => {
  // @ts-ignore as above
  return value.type === 'DATE_LABEL'
}

export const isSignableBy = (txSummary: TransactionSummary, walletAddress: string): boolean => {
  const executionInfo = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo : undefined
  return !!executionInfo?.missingSigners?.some((address) => address.value === walletAddress)
}

export const isExecutable = (txSummary: TransactionSummary, walletAddress: string): boolean => {
  return (
    !txSummary.executionInfo ||
    !isMultisigExecutionInfo(txSummary.executionInfo) ||
    txSummary.executionInfo.confirmationsSubmitted === txSummary.executionInfo.confirmationsRequired ||
    (txSummary.executionInfo.confirmationsSubmitted === txSummary.executionInfo.confirmationsRequired - 1 &&
      isSignableBy(txSummary, walletAddress))
  )
}
