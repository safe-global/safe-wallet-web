import { useAppSelector } from '@/store'
import { selectPendingTxById } from '@/store/pendingTxsSlice'
import { TransactionSummary, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'

const BACKEND_STATUS_LABELS: { [key in TransactionStatus]: string } = {
  [TransactionStatus.AWAITING_CONFIRMATIONS]: 'Awaiting confirmations',
  [TransactionStatus.AWAITING_EXECUTION]: 'Awaiting execution',
  [TransactionStatus.CANCELLED]: 'Cancelled',
  [TransactionStatus.FAILED]: 'Failed',
  [TransactionStatus.SUCCESS]: 'Success',
  [TransactionStatus.WILL_BE_REPLACED]: 'Will be replaced',
  [TransactionStatus.PENDING]: '', // deprecated
}

export const useTransactionStatus = ({ txStatus, id }: TransactionSummary): TransactionStatus | string => {
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, id))
  return pendingTx?.status || BACKEND_STATUS_LABELS[txStatus]
}
