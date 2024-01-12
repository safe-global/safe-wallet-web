import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { isAwaitingExecution, isMultisigExecutionInfo } from '@/utils/transaction-guards'
import { Box, CircularProgress } from '@mui/material'
import TxConfirmations from '../TxConfirmations'
import ExecuteTxButton from '../ExecuteTxButton'
import SignTxButton from '../SignTxButton'
import useIsPending from '@/hooks/useIsPending'

const QueueActions = ({ tx }: { tx: TransactionSummary }) => {
  const isPending = useIsPending(tx.id)

  const requiredConfirmations = isMultisigExecutionInfo(tx.executionInfo)
    ? tx.executionInfo.confirmationsRequired
    : undefined

  const submittedConfirmations = isMultisigExecutionInfo(tx.executionInfo)
    ? tx.executionInfo.confirmationsSubmitted
    : undefined

  const awaitingExecution = isAwaitingExecution(tx.txStatus)

  return (
    <>
      {submittedConfirmations && requiredConfirmations && (
        <Box gridArea="confirmations" flex={1}>
          <TxConfirmations
            submittedConfirmations={submittedConfirmations}
            requiredConfirmations={requiredConfirmations}
          />
        </Box>
      )}

      <Box gridArea="actions" display="flex" justifyContent={{ sm: 'center' }} gap={1}>
        {awaitingExecution ? <ExecuteTxButton txSummary={tx} compact /> : <SignTxButton txSummary={tx} compact />}

        {isPending && <CircularProgress size={14} color="inherit" />}
      </Box>
    </>
  )
}

export default QueueActions
