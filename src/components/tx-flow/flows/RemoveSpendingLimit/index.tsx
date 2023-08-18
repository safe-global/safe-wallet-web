import TxLayout from '@/components/tx-flow/common/TxLayout'
import { RemoveSpendingLimit } from './RemoveSpendingLimit'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import type { SpendingLimitState } from '@/hooks/useSpendingLimits'

const RemoveSpendingLimitFlow = ({ spendingLimit }: { spendingLimit: SpendingLimitState }) => {
  return (
    <TxLayout title="Confirm transaction" subtitle="Remove spending limit" icon={SaveAddressIcon}>
      <RemoveSpendingLimit params={spendingLimit} />
    </TxLayout>
  )
}

export default RemoveSpendingLimitFlow
