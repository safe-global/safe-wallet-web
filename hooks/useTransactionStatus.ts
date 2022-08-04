import { useAppSelector } from '@/store'
import { PendingStatus, selectPendingTxById } from '@/store/pendingTxsSlice'
import { TransactionSummary, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'

export type TxLocalStatus = TransactionStatus | PendingStatus

const STATUS_LABELS: Record<TxLocalStatus, string> = {
  [TransactionStatus.AWAITING_CONFIRMATIONS]: 'Awaiting confirmations',
  [TransactionStatus.AWAITING_EXECUTION]: 'Awaiting execution',
  [TransactionStatus.CANCELLED]: 'Cancelled',
  [TransactionStatus.FAILED]: 'Failed',
  [TransactionStatus.SUCCESS]: 'Success',
  [PendingStatus.SUBMITTING]: 'Submitting',
  [PendingStatus.MINING]: 'Mining',
  [PendingStatus.INDEXING]: 'Indexing',
}

export const getTxStatusLabel = (status: TxLocalStatus): string => {
  return STATUS_LABELS[status] || ''
}

export const isTxPending = (status: TxLocalStatus): boolean => {
  return status in PendingStatus
}

export const useTransactionStatus = ({ txStatus, id }: TransactionSummary): TxLocalStatus => {
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, id))
  return pendingTx?.status || txStatus
}
