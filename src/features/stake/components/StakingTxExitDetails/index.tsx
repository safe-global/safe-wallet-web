import { Box } from '@mui/material'
import type { StakingTxExitInfo, TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import FieldsGrid from '@/components/tx/FieldsGrid'
import TokenAmount from '@/components/common/TokenAmount'
import StakingStatus from '@/features/stake/components/StakingStatus'
import { formatDurationFromSeconds } from '@/utils/formatters'

const StakingTxExitDetails = ({ info }: { info: StakingTxExitInfo; txData?: TransactionData }) => {
  const withdrawIn = formatDurationFromSeconds(info.estimatedExitTime + info.estimatedWithdrawalTime, ['days', 'hours'])
  return (
    <Box pl={1} pr={5} display="flex" flexDirection="column" gap={1}>
      <FieldsGrid title="Receive">
        <TokenAmount
          value={info.value}
          tokenSymbol={info.tokenInfo.symbol}
          decimals={info.tokenInfo.decimals}
          logoUri={info.tokenInfo.logoUri}
        />
      </FieldsGrid>

      <FieldsGrid title="Exit">
        {info.numValidators} Validator{info.numValidators > 1 ? 's' : ''}
      </FieldsGrid>

      <FieldsGrid title="Est. exit time">Up to {withdrawIn}</FieldsGrid>

      <FieldsGrid title="Exit">
        <StakingStatus status={info.status} />
      </FieldsGrid>
    </Box>
  )
}

export default StakingTxExitDetails
