import TxLayout from '@/components/tx-flow/common/TxLayout'
import { ReviewRemoveGuard } from '@/components/tx-flow/flows/RemoveGuard/ReviewRemoveGuard'

// TODO: This can possibly be combined with the remove module type
export type RemoveGuardFlowProps = {
  address: string
}

const RemoveGuardFlow = ({ address }: RemoveGuardFlowProps) => {
  return (
    <TxLayout title="Confirm transaction" subtitle="Remove guard">
      <ReviewRemoveGuard params={{ address }} />
    </TxLayout>
  )
}

export default RemoveGuardFlow
