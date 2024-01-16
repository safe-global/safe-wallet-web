import { CircularProgress } from '@mui/material'
import { TransactionStatus, type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import useIsPending from '@/hooks/useIsPending'
import useTransactionStatus from '@/hooks/useTransactionStatus'
import TxStatusChip from '../TxStatusChip'

const getStatusColor = (value: TransactionStatus) => {
  switch (value) {
    case TransactionStatus.SUCCESS:
      return 'success'
    case TransactionStatus.FAILED:
    case TransactionStatus.CANCELLED:
      return 'error'
    case TransactionStatus.AWAITING_CONFIRMATIONS:
    case TransactionStatus.AWAITING_EXECUTION:
      return 'warning'
    default:
      return 'primary'
  }
}

const TxStatusLabel = ({ tx }: { tx: TransactionSummary }) => {
  const txStatusLabel = useTransactionStatus(tx)
  const isPending = useIsPending(tx.id)

  return (
    <TxStatusChip color={getStatusColor(tx.txStatus)}>
      {isPending && <CircularProgress size={14} color="inherit" />}
      {txStatusLabel}
    </TxStatusChip>
  )
}

export default TxStatusLabel
