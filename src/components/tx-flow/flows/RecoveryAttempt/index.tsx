import TxLayout from '@/components/tx-flow/common/TxLayout'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import RecoveryAttemptReview, { type RecoveryAttemptReviewProps } from './RecoveryAttemptReview'

const RecoveryAttemptFlow = ({ params }: { params: RecoveryAttemptReviewProps['params'] }) => {
  return (
    <TxLayout title="Recovery" subtitle="Confirm recovery" icon={SaveAddressIcon} step={0}>
      <RecoveryAttemptReview params={params} />
    </TxLayout>
  )
}

export default RecoveryAttemptFlow
