import { Typography, Box } from '@mui/material'
import { formatDuration, intervalToDuration } from 'date-fns'
import FieldsGrid from '@/components/tx/FieldsGrid'
import type { NativeStakingDepositConfirmationView } from '@safe-global/safe-gateway-typescript-sdk'
import TokenInfoPair from '@/components/tx/ConfirmationOrder/TokenInfoPair'
import { formatVisualAmount, safeFormatUnits } from '@/utils/formatters'
import { formatCurrency } from '@/utils/formatNumber'

type StakingOrderConfirmationViewProps = {
  order: NativeStakingDepositConfirmationView
  contractAddress: string
  value?: string
}

const ETH_PER_VALIDATOR = 32
const CURRENCY = 'USD'

const formatSeconds = (seconds: number) => {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 })
  return formatDuration(duration, {
    format: ['hours', 'minutes'],
  })
}

const StakingOrderConfirmationView = ({ order, value }: StakingOrderConfirmationViewProps) => {
  const amount = safeFormatUnits(BigInt(value || '0'), order.tokenInfo.decimals)
  const validators = Number(amount) / ETH_PER_VALIDATOR

  /* https://docs.api.kiln.fi/reference/getethnetworkstats */
  return (
    <>
      <TokenInfoPair
        blocks={[
          {
            value: value || '',
            tokenInfo: order.tokenInfo,
            label: 'Deposit',
          },
          {
            value: order.annualNrr.toFixed(3) + '%',
            label: 'Earn (after fees)',
          },
        ]}
      />

      <FieldsGrid title="Annual rewards">
        {formatVisualAmount(order.expectedAnnualReward.toString(), order.tokenInfo.decimals)} {order.tokenInfo.symbol}
        {' ('}
        {formatCurrency(order.expectedFiatAnnualReward, CURRENCY)})
      </FieldsGrid>

      <FieldsGrid title="Monthly rewards">
        {formatVisualAmount(order.expectedMonthlyReward.toString(), order.tokenInfo.decimals)} {order.tokenInfo.symbol}
        {' ('}
        {formatCurrency(order.expectedFiatMonthlyReward, CURRENCY)})
      </FieldsGrid>

      <FieldsGrid title="Fee">{order.fee}%</FieldsGrid>

      <Box borderRadius={1} border="1px solid" borderColor="border.light" p={2}>
        <Typography fontWeight="bold" mb={2}>
          You will own{' '}
          <Box component="span" bgcolor="border.background" px={1} py={0.5} borderRadius={1}>
            {validators} Ethereum validator{validators === 1 ? '' : 's'}
          </Box>
        </Typography>

        <FieldsGrid title="Active in">{formatSeconds(order.estimatedEntryTime)}</FieldsGrid>
        <FieldsGrid title="Rewards">Approx. every 5 days after 4 days from activation</FieldsGrid>

        <Typography variant="body2" color="text.secondary" mt={2}>
          Earn ETH rewards with dedicated validators. Rewards must be withdrawn manually, and you can request a
          withdrawal at any time.
        </Typography>
      </Box>
    </>
  )
}

export default StakingOrderConfirmationView
