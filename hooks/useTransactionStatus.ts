import { useAppSelector } from '@/store'
import { selectPendingTxByHash } from '@/store/pendingTxsSlice'
import { TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'

const BACKEND_STATUS_LABELS: { [key in TransactionStatus]: string } = {
  [TransactionStatus.AWAITING_CONFIRMATIONS]: 'Awaiting confirmations',
  [TransactionStatus.AWAITING_EXECUTION]: 'Awaiting execution',
  [TransactionStatus.CANCELLED]: 'Cancelled',
  [TransactionStatus.FAILED]: 'Failed',
  [TransactionStatus.SUCCESS]: 'Success',
  [TransactionStatus.WILL_BE_REPLACED]: '', // deprecated
  [TransactionStatus.PENDING]: '', // deprecated
}

export const useTransactionStatus = ({ txStatus, txHash }: { txStatus: TransactionStatus; txHash: string }): string => {
  const pendingTx = useAppSelector((state) => selectPendingTxByHash(state, txHash))
  return pendingTx?.status || BACKEND_STATUS_LABELS[txStatus]
}
