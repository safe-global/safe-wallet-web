import { Typography, Box } from '@mui/material'
import { formatDuration, intervalToDuration } from 'date-fns'
import FieldsGrid from '@/components/tx/FieldsGrid'
import type { NativeStakingDepositConfirmationView } from '@safe-global/safe-gateway-typescript-sdk'
import TokenInfoPair from '@/components/tx/ConfirmationOrder/TokenInfoPair'
import { formatVisualAmount } from '@/utils/formatters'
import { formatCurrency } from '@/utils/formatNumber'

type StakingOrderConfirmationViewProps = {
  order: NativeStakingDepositConfirmationView
}

const CURRENCY = 'USD'

const formatSeconds = (seconds: number) => {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 })
  return formatDuration(duration, {
    format: ['hours', 'minutes'],
  })
}

/* https://docs.api.kiln.fi/reference/getethnetworkstats */
const StakingOrderConfirmationView = ({ order }: StakingOrderConfirmationViewProps) => {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TokenInfoPair
        blocks={[
          {
            value: order.value || '0',
            tokenInfo: order.tokenInfo,
            label: 'Deposit',
          },
          {
            value: order.annualNrr.toFixed(3) + '%',
            label: 'Earn (after fees)',
          },
        ]}
      />

      <FieldsGrid title="Net annual rewards">
        {formatVisualAmount(order.expectedAnnualReward, order.tokenInfo.decimals)} {order.tokenInfo.symbol}
        {' ('}
        {formatCurrency(order.expectedFiatAnnualReward, CURRENCY)})
      </FieldsGrid>

      <FieldsGrid title="Net monthly rewards">
        {formatVisualAmount(order.expectedMonthlyReward, order.tokenInfo.decimals)} {order.tokenInfo.symbol}
        {' ('}
        {formatCurrency(order.expectedFiatMonthlyReward, CURRENCY)})
      </FieldsGrid>

      <FieldsGrid title="Fee">{order.fee}%</FieldsGrid>

      <Box borderRadius={1} border="1px solid" borderColor="border.light" p={2}>
        <Typography fontWeight="bold" mb={2}>
          You will own{' '}
          <Box component="span" bgcolor="border.background" px={1} py={0.5} borderRadius={1}>
            {order.numValidators} Ethereum validator{order.numValidators === 1 ? '' : 's'}
          </Box>
        </Typography>

        <FieldsGrid title="Active in">{formatSeconds(order.estimatedEntryTime)}</FieldsGrid>
        <FieldsGrid title="Rewards">Approx. every 5 days after 4 days from activation</FieldsGrid>

        <Typography variant="body2" color="text.secondary" mt={2}>
          Earn ETH rewards with dedicated validators. Rewards must be withdrawn manually, and you can request a
          withdrawal at any time.
        </Typography>
      </Box>
    </Box>
  )
}

export default StakingOrderConfirmationView
