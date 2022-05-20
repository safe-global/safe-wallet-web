import { useAppSelector } from '@/store'
import { PENDING_STATE, selectPendingTxById } from '@/store/pendingTxsSlice'
import { TransactionSummary, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'

const BACKEND_STATUS: { [key in TransactionStatus]: string } = {
  [TransactionStatus.AWAITING_CONFIRMATIONS]: 'Awaiting Confirmations',
  [TransactionStatus.AWAITING_EXECUTION]: 'Awaiting Execution',
  [TransactionStatus.CANCELLED]: 'Cancelled',
  [TransactionStatus.FAILED]: 'Failed',
  [TransactionStatus.SUCCESS]: 'Success',
  [TransactionStatus.PENDING]: 'Pending', // Legacy frontend only status
  [TransactionStatus.WILL_BE_REPLACED]: 'Will Be Replaced',
}

const PENDING_STATUS: Partial<{ [key in PENDING_STATE]: string }> = {
  SUBMITTING: 'Submitting',
  MINING: 'Mining',
  MINED: 'Indexing',
}

export const useTransactionStatus = ({
  txStatus,
  id,
}: TransactionSummary): TransactionStatus | typeof PENDING_STATUS[PENDING_STATE] => {
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, id))

  if (!pendingTx || !pendingTx.state) {
    return BACKEND_STATUS[txStatus]
  }

  return PENDING_STATUS[pendingTx.state] || BACKEND_STATUS[txStatus]
}
