import { Stack } from '@mui/material'
import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { isAwaitingExecution } from '@/utils/transaction-guards'
import ExecuteTxButton from '../ExecuteTxButton'
import SignTxButton from '../SignTxButton'
import { useAppSelector } from '@/store'
import { PendingStatus, selectPendingTxById } from '@/store/pendingTxsSlice'
import { SpeedUpMonitor } from '@/features/speedup/components/SpeedUpMonitor'

const QueueActions = ({ tx }: { tx: TransactionSummary }) => {
  const awaitingExecution = isAwaitingExecution(tx.txStatus)
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, tx.id))

  let ExecutionComponent = null
  if (!pendingTx) {
    ExecutionComponent = <SignTxButton txSummary={tx} compact />
    if (awaitingExecution) {
      ExecutionComponent = <ExecuteTxButton txSummary={tx} compact />
    }
  }

  return (
    <Stack data-testid="tx-actions" mr={2} justifyContent="center">
      {ExecutionComponent}
      {pendingTx && pendingTx.status === PendingStatus.PROCESSING && (
        <SpeedUpMonitor txId={tx.id} pendingTx={pendingTx} modalTrigger="alertButton" />
      )}
    </Stack>
  )
}

export default QueueActions
