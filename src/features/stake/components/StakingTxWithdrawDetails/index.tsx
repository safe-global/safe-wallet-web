import { Stack } from '@mui/material'
import type { StakingTxWithdrawInfo } from '@safe-global/safe-gateway-typescript-sdk'
import StakingConfirmationTxWithdraw from '@/features/stake/components/StakingConfirmationTx/Withdraw'

const StakingTxWithdrawDetails = ({ info }: { info: StakingTxWithdrawInfo }) => {
  return (
    <Stack pl={1} pr={5} spacing={1}>
      <StakingConfirmationTxWithdraw order={info} />
    </Stack>
  )
}

export default StakingTxWithdrawDetails
