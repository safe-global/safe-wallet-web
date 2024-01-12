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
    <Box display="flex" gap={1}>
      {submittedConfirmations && requiredConfirmations && (
        <Box flex={1}>
          <TxConfirmations
            submittedConfirmations={submittedConfirmations}
            requiredConfirmations={requiredConfirmations}
          />
        </Box>
      )}

      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
        {awaitingExecution ? <ExecuteTxButton txSummary={tx} compact /> : <SignTxButton txSummary={tx} compact />}
      </Box>
    </Box>
  )
}

export default QueueActions
