import TxLayout from '@/components/tx-flow/common/TxLayout'
import { ReviewRemoveModule } from './ReviewRemoveModule'

export type RemoveModuleFlowProps = {
  address: string
}

const RemoveModuleFlow = ({ address }: RemoveModuleFlowProps) => {
  return (
    <TxLayout title="Confirm transaction" subtitle="Remove module">
      <ReviewRemoveModule params={{ address }} />
    </TxLayout>
  )
}

export default RemoveModuleFlow
