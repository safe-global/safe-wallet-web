import type { AnyStakingConfirmationView } from '@safe-global/safe-gateway-typescript-sdk'
import { ConfirmationViewTypes, type StakingTxInfo } from '@safe-global/safe-gateway-typescript-sdk'
import StakingConfirmationTxDeposit from '@/features/stake/components/StakingConfirmationTx/Deposit'
import StakingConfirmationTxExit from '@/features/stake/components/StakingConfirmationTx/Exit'
import StakingConfirmationTxWithdraw from '@/features/stake/components/StakingConfirmationTx/Withdraw'

type StakingOrderConfirmationViewProps = {
  order: AnyStakingConfirmationView | StakingTxInfo
}

const StrakingConfirmationTx = ({ order }: StakingOrderConfirmationViewProps) => {
  const isDeposit = order.type === ConfirmationViewTypes.KILN_NATIVE_STAKING_DEPOSIT
  const isExit = order.type === ConfirmationViewTypes.KILN_NATIVE_STAKING_VALIDATORS_EXIT
  const isWithdraw = order.type === ConfirmationViewTypes.KILN_NATIVE_STAKING_WITHDRAW

  if (isDeposit) {
    return <StakingConfirmationTxDeposit order={order} />
  }

  if (isExit) {
    return <StakingConfirmationTxExit order={order} />
  }

  if (isWithdraw) {
    return <StakingConfirmationTxWithdraw order={order} />
  }

  return null
}

export default StrakingConfirmationTx
