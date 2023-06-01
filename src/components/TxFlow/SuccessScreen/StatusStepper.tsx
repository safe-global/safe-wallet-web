import { Box, Step, StepConnector, Stepper, Typography } from '@mui/material'
import css from '@/components/new-safe/create/steps/StatusStep/styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'
import StatusStep from '@/components/new-safe/create/steps/StatusStep/StatusStep'
import { TxEvent } from '@/services/tx/txEvents'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useAppSelector } from '@/store'
import { selectPendingTxById } from '@/store/pendingTxsSlice'

const StatusStepper = ({ status, txId }: { status: TxEvent; txId: string }) => {
  const { safeAddress } = useSafeInfo()
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, txId))
  const { txHash = '' } = pendingTx || {}

  const isProcessing = status === TxEvent.PROCESSING || status === TxEvent.PROCESSED || status === TxEvent.SUCCESS
  const isProcessed = status === TxEvent.PROCESSED || status === TxEvent.SUCCESS
  const isSuccess = status === TxEvent.SUCCESS

  return (
    <Stepper orientation="vertical" nonLinear connector={<StepConnector className={css.connector} />}>
      <Step>
        <StatusStep isLoading={!isProcessing} safeAddress={safeAddress}>
          <Box>
            <Typography variant="body2" fontWeight="700">
              Your transaction
            </Typography>
            {txHash && (
              <EthHashInfo
                address={txHash}
                hasExplorer
                showCopyButton
                showName={false}
                shortAddress={false}
                showAvatar={false}
              />
            )}
          </Box>
        </StatusStep>
      </Step>
      <Step>
        <StatusStep isLoading={!isProcessed} safeAddress={safeAddress}>
          <Box>
            <Typography variant="body2" fontWeight="700">
              {isProcessed ? 'Processed' : 'Processing'}
            </Typography>
          </Box>
        </StatusStep>
      </Step>
      <Step>
        <StatusStep isLoading={!isSuccess} safeAddress={safeAddress}>
          <Typography variant="body2" fontWeight="700">
            {isSuccess ? 'Indexed' : 'Indexing'}
          </Typography>
        </StatusStep>
      </Step>
    </Stepper>
  )
}

export default StatusStepper
