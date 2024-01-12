import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { isAwaitingExecution, isMultisigExecutionInfo } from '@/utils/transaction-guards'
import { Box } from '@mui/material'
import TxConfirmations from '../TxConfirmations'
import ExecuteTxButton from '../ExecuteTxButton'
import SignTxButton from '../SignTxButton'

const QueueActions = ({ tx }: { tx: TransactionSummary }) => {
  const requiredConfirmations = isMultisigExecutionInfo(tx.executionInfo)
    ? tx.executionInfo.confirmationsRequired
    : undefined

  const submittedConfirmations = isMultisigExecutionInfo(tx.executionInfo)
    ? tx.executionInfo.confirmationsSubmitted
    : undefined

  const awaitingExecution = isAwaitingExecution(tx.txStatus)

  return (
    <Box display="flex" gap={3} alignItems="center" pr={2}>
      {submittedConfirmations && requiredConfirmations && (
        <TxConfirmations
          submittedConfirmations={submittedConfirmations}
          requiredConfirmations={requiredConfirmations}
        />
      )}

      {awaitingExecution ? <ExecuteTxButton txSummary={tx} compact /> : <SignTxButton txSummary={tx} compact />}
    </Box>
  )
}

export default QueueActions
