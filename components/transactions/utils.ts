import { MultisigExecutionInfo, TransactionStatus, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'

export const isTxQueued = (value: TransactionStatus): boolean => {
  return [
    TransactionStatus.PENDING,
    TransactionStatus.AWAITING_CONFIRMATIONS,
    TransactionStatus.AWAITING_EXECUTION,
    TransactionStatus.WILL_BE_REPLACED,
  ].includes(value)
}

export const isMultisigExecutionInfo = (value: TransactionSummary['executionInfo']): value is MultisigExecutionInfo =>
  value?.type === 'MULTISIG'
