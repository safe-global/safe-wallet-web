import { Stack } from '@mui/material'
import FieldsGrid from '@/components/tx/FieldsGrid'
import {
  type NativeStakingWithdrawConfirmationView,
  type StakingTxWithdrawInfo,
} from '@safe-global/safe-gateway-typescript-sdk'
import TokenAmount from '@/components/common/TokenAmount'

type StakingOrderConfirmationViewProps = {
  order: NativeStakingWithdrawConfirmationView | StakingTxWithdrawInfo
}

const StakingConfirmationTxWithdraw = ({ order }: StakingOrderConfirmationViewProps) => {
  return (
    <Stack gap={2}>
      <FieldsGrid title="Receive">
        {' '}
        <TokenAmount
          value={order.value}
          tokenSymbol={order.tokenInfo.symbol}
          decimals={order.tokenInfo.decimals}
          logoUri={order.tokenInfo.logoUri}
        />
      </FieldsGrid>
    </Stack>
  )
}

export default StakingConfirmationTxWithdraw
