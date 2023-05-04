import { Box, Step, StepConnector, Stepper, Typography } from '@mui/material'
import css from '@/components/new-safe/create/steps/StatusStep/styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'
import { SafeCreationStatus } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'
import type { PendingSafeData } from '@/components/new-safe/create/steps/StatusStep/index'
import StatusStep from '@/components/new-safe/create/steps/StatusStep/StatusStep'

const StatusStepper = ({ pendingSafe, status }: { pendingSafe: PendingSafeData; status: SafeCreationStatus }) => {
  if (!pendingSafe?.safeAddress) return null

  return (
    <Stepper orientation="vertical" nonLinear connector={<StepConnector className={css.connector} />}>
      <Step>
        <StatusStep isLoading={!pendingSafe.safeAddress} safeAddress={pendingSafe.safeAddress}>
          <Box>
            <Typography variant="body2" fontWeight="700">
              Your Safe address
            </Typography>
            <EthHashInfo
              address={pendingSafe.safeAddress}
              hasExplorer
              showCopyButton
              showName={false}
              shortAddress={false}
              showAvatar={false}
            />
          </Box>
        </StatusStep>
      </Step>
      <Step>
        <StatusStep isLoading={!(pendingSafe.txHash || pendingSafe.taskId)} safeAddress={pendingSafe.safeAddress}>
          <Box>
            <Typography variant="body2" fontWeight="700">
              Validating transaction
            </Typography>
            {pendingSafe.txHash && (
              <EthHashInfo
                address={pendingSafe.txHash}
                hasExplorer
                showCopyButton
                showName={false}
                shortAddress={true}
                showAvatar={false}
              />
            )}
          </Box>
        </StatusStep>
      </Step>
      <Step>
        <StatusStep isLoading={status < SafeCreationStatus.SUCCESS} safeAddress={pendingSafe.safeAddress}>
          <Typography variant="body2" fontWeight="700">
            Processing
          </Typography>
        </StatusStep>
      </Step>
      <Step>
        <StatusStep isLoading={status !== SafeCreationStatus.INDEXED} safeAddress={pendingSafe.safeAddress}>
          <Typography variant="body2" fontWeight="700">
            Safe is ready
          </Typography>
        </StatusStep>
      </Step>
    </Stepper>
  )
}

export default StatusStepper
