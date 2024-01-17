import { Box } from '@mui/material'
import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { isAwaitingExecution } from '@/utils/transaction-guards'
import ExecuteTxButton from '../ExecuteTxButton'
import SignTxButton from '../SignTxButton'

const QueueActions = ({ tx }: { tx: TransactionSummary }) => {
  const awaitingExecution = isAwaitingExecution(tx.txStatus)

  return (
    <Box my={-1}>
      {awaitingExecution ? <ExecuteTxButton txSummary={tx} compact /> : <SignTxButton txSummary={tx} compact />}
    </Box>
  )
}

export default QueueActions
