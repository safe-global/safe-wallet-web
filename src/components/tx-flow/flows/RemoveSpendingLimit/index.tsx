import TxLayout from '@/components/tx-flow/common/TxLayout'
import { RemoveSpendingLimit } from './RemoveSpendingLimit'
import type { SpendingLimitState } from '@/store/spendingLimitsSlice'

const RemoveSpendingLimitFlow = ({ spendingLimit }: { spendingLimit: SpendingLimitState }) => {
  return (
    <TxLayout title="Remove spending limit">
      <RemoveSpendingLimit params={spendingLimit} />
    </TxLayout>
  )
}

export default RemoveSpendingLimitFlow
