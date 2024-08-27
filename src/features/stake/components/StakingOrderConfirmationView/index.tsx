import { Typography } from '@mui/material'
import { formatDuration, intervalToDuration } from 'date-fns'
import FieldsGrid from '@/components/tx/FieldsGrid'
import type { NativeStakingDepositConfirmationView } from '@safe-global/safe-gateway-typescript-sdk'
import TokenInfoPair from '@/components/tx/ConfirmationOrder/TokenInfoPair'

type StakingOrderConfirmationViewProps = {
  order: NativeStakingDepositConfirmationView
  contractAddress: string
  value?: string
}

const formatSeconds = (seconds: number) => {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 })
  return formatDuration(duration, {
    format: ['hours', 'minutes'],
  })
}

const StakingOrderConfirmationView = ({ order, value }: StakingOrderConfirmationViewProps) => {
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

      <FieldsGrid title="Time to active *">{formatSeconds(order.estimatedEntryTime)}</FieldsGrid>
      <FieldsGrid title="Time to exit">{formatSeconds(order.estimatedExitTime)}</FieldsGrid>
      <FieldsGrid title="Time to withdraw">{formatSeconds(order.estimatedWithdrawalTime)}</FieldsGrid>
      <FieldsGrid title="Fee">{order.fee}%</FieldsGrid>
      <FieldsGrid title="Annual NRR">{order.annualNrr.toFixed(3)}%</FieldsGrid>

      <Typography variant="body2" color="text.secondary" display="flex">
        <span>*&nbsp;</span>
        <span>
          Estimated time to active is the time it takes for the staking order to be activated and start earning rewards
          after executing this transaction.
        </span>
      </Typography>
    </>
  )
}

export default StakingOrderConfirmationView
