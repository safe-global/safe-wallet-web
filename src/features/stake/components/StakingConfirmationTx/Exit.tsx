import { Alert, Stack, Typography } from '@mui/material'
import FieldsGrid from '@/components/tx/FieldsGrid'
import { formatDurationFromMilliseconds } from '@/utils/formatters'
import { type NativeStakingValidatorsExitConfirmationView } from '@safe-global/safe-gateway-typescript-sdk/dist/types/decoded-data'
import ConfirmationOrderHeader from '@/components/tx/ConfirmationOrder/ConfirmationOrderHeader'
import { InfoTooltip } from '@/features/stake/components/InfoTooltip'

type StakingOrderConfirmationViewProps = {
  order: NativeStakingValidatorsExitConfirmationView
}

const StakingConfirmationTxExit = ({ order }: StakingOrderConfirmationViewProps) => {
  const withdrawIn = formatDurationFromMilliseconds(order.estimatedExitTime + order.estimatedWithdrawalTime, [
    'days',
    'hours',
  ])

  return (
    <Stack gap={2}>
      <ConfirmationOrderHeader
        blocks={[
          {
            value: `${order.numValidators || 0} Validators`,
            label: 'Exit',
          },
          {
            value: order.value || '0',
            tokenInfo: order.tokenInfo,
            label: 'Receive',
          },
        ]}
      />

      <FieldsGrid
        title={
          <>
            Withdraw in
            <InfoTooltip
              title={
                <>
                  Withdrawal time is the sum of:
                  <ul>
                    <li>Time until your validator is successfully exited after the withdraw request</li>
                    <li>Time for a stake to receive Consensus rewards on the execution layer</li>
                  </ul>
                </>
              }
            />
          </>
        }
      >
        Up to {withdrawIn}
      </FieldsGrid>

      <Typography variant="body2" color="text.secondary" mt={2}>
        The selected amount and any rewards will be withdrawn from Dedicated Staking for ETH after the validator exit.
      </Typography>

      <Alert severity="warning" sx={{ mb: 1 }}>
        This transaction is a withdrawal request. After it&apos;s executed, you&apos;ll need to complete a separate
        withdrawal transaction.
      </Alert>
    </Stack>
  )
}

export default StakingConfirmationTxExit
