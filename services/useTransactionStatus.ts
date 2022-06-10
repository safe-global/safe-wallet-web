import { useAppSelector } from '@/store'
import { selectPendingTxsByChainId } from '@/store/pendingTxsSlice'
import { TransactionSummary, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'
import useChainId from '@/services/useChainId'

const BACKEND_STATUS_LABELS: { [key in TransactionStatus]: string } = {
  [TransactionStatus.AWAITING_CONFIRMATIONS]: 'Awaiting Confirmations',
  [TransactionStatus.AWAITING_EXECUTION]: 'Awaiting Execution',
  [TransactionStatus.CANCELLED]: 'Cancelled',
  [TransactionStatus.FAILED]: 'Failed',
  [TransactionStatus.SUCCESS]: 'Success',
  [TransactionStatus.PENDING]: 'Pending', // Legacy frontend only status
  [TransactionStatus.WILL_BE_REPLACED]: 'Will Be Replaced',
}

export const useTransactionStatus = ({ txStatus, id }: TransactionSummary): TransactionStatus | string => {
  const chainId = useChainId()
  const pendingTxOnChain = useAppSelector((state) => selectPendingTxsByChainId(state, chainId))
  return pendingTxOnChain?.[id]?.status || BACKEND_STATUS_LABELS[txStatus]
}
