import { Box } from '@mui/material'
import type { StakingTxWithdrawInfo } from '@safe-global/safe-gateway-typescript-sdk'
import StakingConfirmationTxWithdraw from '@/features/stake/components/StakingConfirmationTx/Withdraw'

const StakingTxWithdrawDetails = ({ info }: { info: StakingTxWithdrawInfo }) => {
  return (
    <Box pl={1} pr={5} display="flex" flexDirection="column" gap={1}>
      <StakingConfirmationTxWithdraw order={info} />
    </Box>
  )
}

export default StakingTxWithdrawDetails
