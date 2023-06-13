import TxLayout from '@/components/tx-flow/common/TxLayout'
import { UpdateSafeReview } from './UpdateSafeReview'

const UpdateSafeFlow = () => {
  return (
    <TxLayout title="Update Safe Account version">
      <UpdateSafeReview />
    </TxLayout>
  )
}

export default UpdateSafeFlow
