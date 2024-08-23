import FieldsGrid from '@/components/tx/FieldsGrid'
import type { NativeStakingDepositConfirmationView } from '@safe-global/safe-gateway-typescript-sdk'

type StakingOrderConfirmationViewProps = {
  order: NativeStakingDepositConfirmationView
  contractAddress: string
}

const StakingOrderConfirmationView = ({ order }: StakingOrderConfirmationViewProps) => {
  return (
    <>
      <FieldsGrid title="Estimated entry time">{order.estimatedEntryTime}</FieldsGrid>
      <FieldsGrid title="Estimated exit time">{order.estimatedExitTime}</FieldsGrid>
      <FieldsGrid title="Estimated withdrawal time">{order.estimatedWithdrawalTime}</FieldsGrid>
      <FieldsGrid title="Fee">{order.fee}</FieldsGrid>
      <FieldsGrid title="Monthly NRR">{order.monthlyNrr}</FieldsGrid>
      <FieldsGrid title="Annual NRR">{order.annualNrr}</FieldsGrid>
    </>
  )
}

export default StakingOrderConfirmationView
