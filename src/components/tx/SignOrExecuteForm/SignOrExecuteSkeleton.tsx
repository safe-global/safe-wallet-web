import LoadingSpinner, { SpinnerStatus } from '@/components/new-safe/create/steps/StatusStep/LoadingSpinner'
import TxCard from '@/components/tx-flow/common/TxCard'
import { Stack } from '@mui/material'

const SignOrExecuteSkeleton = () => (
  <TxCard>
    <Stack minHeight="38svh" alignItems="center" justifyContent="center" mb={5}>
      <LoadingSpinner status={SpinnerStatus.PROCESSING} />
    </Stack>
  </TxCard>
)

export default SignOrExecuteSkeleton
