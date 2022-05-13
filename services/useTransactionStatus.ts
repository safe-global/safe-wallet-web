import { useAppSelector } from '@/store'
import { PENDING_STATUS, selectPendingTxById } from '@/store/pendingTxsSlice'
import { TransactionSummary, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'

export const useTransactionStatus = ({ txStatus, id }: TransactionSummary): TransactionStatus | PENDING_STATUS => {
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, id))

  return pendingTx?.txStatus ?? txStatus
}
