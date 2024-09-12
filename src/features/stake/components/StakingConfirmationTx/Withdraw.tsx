import { Stack } from '@mui/material'
import FieldsGrid from '@/components/tx/FieldsGrid'
import type {
  NativeStakingWithdrawConfirmationView,
  StakingTxWithdrawInfo,
} from '@safe-global/safe-gateway-typescript-sdk'
import { ConfirmationViewTypes } from '@safe-global/safe-gateway-typescript-sdk'
import TokenAmount from '@/components/common/TokenAmount'

type StakingOrderConfirmationViewProps = {
  order: NativeStakingWithdrawConfirmationView | StakingTxWithdrawInfo
}

const StakingConfirmationTxWithdraw = ({ order }: StakingOrderConfirmationViewProps) => {
  const isOrder = order.type === ConfirmationViewTypes.KILN_NATIVE_STAKING_WITHDRAW
  return (
    <Stack gap={2}>
      <FieldsGrid title={isOrder ? 'Receive' : 'Amount'}>
        {' '}
        <TokenAmount
          value={order.rewards}
          tokenSymbol={order.tokenInfo.symbol}
          decimals={order.tokenInfo.decimals}
          logoUri={order.tokenInfo.logoUri}
        />
      </FieldsGrid>
    </Stack>
  )
}

export default StakingConfirmationTxWithdraw
