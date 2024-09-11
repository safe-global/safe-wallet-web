import { Typography, Stack, Box } from '@mui/material'
import FieldsGrid from '@/components/tx/FieldsGrid'
import type { StakingTxDepositInfo } from '@safe-global/safe-gateway-typescript-sdk'
import {
  ConfirmationViewTypes,
  type NativeStakingDepositConfirmationView,
} from '@safe-global/safe-gateway-typescript-sdk'
import ConfirmationOrderHeader from '@/components/tx/ConfirmationOrder/ConfirmationOrderHeader'
import { formatVisualAmount, formatDurationFromSeconds } from '@/utils/formatters'
import { formatCurrency } from '@/utils/formatNumber'
import StakingStatus from '@/features/stake/components/StakingStatus'

type StakingOrderConfirmationViewProps = {
  order: NativeStakingDepositConfirmationView | StakingTxDepositInfo
}

const CURRENCY = 'USD'

const StakingConfirmationTxDeposit = ({ order }: StakingOrderConfirmationViewProps) => {
  const isOrder = order.type === ConfirmationViewTypes.KILN_NATIVE_STAKING_DEPOSIT

  return (
    <Stack gap={isOrder ? 2 : 1}>
      {isOrder && (
        <ConfirmationOrderHeader
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
      )}

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

      <Stack
        {...{ [isOrder ? 'border' : 'borderTop']: '1px solid' }}
        {...(isOrder ? { p: 2, borderRadius: 1 } : { mt: 1, pt: 2, pb: 1 })}
        borderColor="border.light"
        gap={1}
      >
        {isOrder ? (
          <Typography fontWeight="bold" mb={2}>
            You will own{' '}
            <Box component="span" bgcolor="border.background" px={1} py={0.5} borderRadius={1}>
              {order.numValidators} Ethereum validator{order.numValidators === 1 ? '' : 's'}
            </Box>
          </Typography>
        ) : (
          <FieldsGrid title="Validators">{order.numValidators}</FieldsGrid>
        )}

        <FieldsGrid title="Active in">{formatDurationFromSeconds(order.estimatedEntryTime)}</FieldsGrid>
        <FieldsGrid title="Rewards">Approx. every 5 days after 4 days from activation</FieldsGrid>

        {!isOrder && (
          <FieldsGrid title="Status">
            <StakingStatus status={order.status} />
          </FieldsGrid>
        )}

        {isOrder && (
          <Typography variant="body2" color="text.secondary" mt={2}>
            Earn ETH rewards with dedicated validators. Rewards must be withdrawn manually, and you can request a
            withdrawal at any time.
          </Typography>
        )}
      </Stack>
    </Stack>
  )
}

export default StakingConfirmationTxDeposit
