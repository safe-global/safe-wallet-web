import { useAppSelector } from '@/store'
import { PendingStatus, selectPendingTxById } from '@/store/pendingTxsSlice'
import { TransactionSummary, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'

type TxLocalStatus = TransactionStatus | PendingStatus

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

const useTransactionStatus = ({ txStatus, id }: TransactionSummary): string => {
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, id))
  return STATUS_LABELS[pendingTx?.status || txStatus] || ''
}

export default useTransactionStatus
