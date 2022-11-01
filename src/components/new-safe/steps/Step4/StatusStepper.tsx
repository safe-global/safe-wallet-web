import { Box, Step, StepConnector, Stepper, Typography } from '@mui/material'
import css from '@/components/new-safe/steps/Step4/styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import type { PendingSafeData } from '@/components/new-safe/steps/Step4/index'
import StatusStep from '@/components/new-safe/steps/Step4/StatusStep'

const StatusStepper = ({ pendingSafe, status }: { pendingSafe: PendingSafeData; status: SafeCreationStatus }) => {
  if (!pendingSafe?.safeAddress) return null

  const isSuccess =
    status === SafeCreationStatus.SUCCESS ||
    status === SafeCreationStatus.INDEXED ||
    status === SafeCreationStatus.INDEX_FAILED

  return (
    <Stepper orientation="vertical" nonLinear connector={<StepConnector className={css.connector} />}>
      <Step>
        <StatusStep isLoading={!pendingSafe.safeAddress} safeAddress={pendingSafe.safeAddress}>
          <Box>
            <Typography variant="body2" fontWeight="700">
              Your Safe address:
            </Typography>
            <EthHashInfo
              address={pendingSafe.safeAddress}
              hasExplorer
              showCopyButton
              shortAddress={false}
              showAvatar={false}
            />
          </Box>
        </StatusStep>
      </Step>
      <Step>
        <StatusStep isLoading={!pendingSafe.txHash} safeAddress={pendingSafe.safeAddress}>
          <Box>
            <Typography variant="body2" fontWeight="700">
              Validating Transaction
            </Typography>
            {pendingSafe.txHash && (
              <EthHashInfo
                address={pendingSafe.txHash}
                hasExplorer
                showCopyButton
                shortAddress={true}
                showAvatar={false}
              />
            )}
          </Box>
        </StatusStep>
      </Step>
      <Step>
        <StatusStep isLoading={!isSuccess} safeAddress={pendingSafe.safeAddress}>
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
