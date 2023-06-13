import TxLayout from '@/components/tx-flow/common/TxLayout'
import ReviewChangeThreshold from '@/components/tx-flow/flows/ChangeThreshold/ReviewChangeThreshold'

const ChangeThresholdFlow = () => {
  return (
    <TxLayout title="Change threshold">
      <ReviewChangeThreshold />
    </TxLayout>
  )
}

export default ChangeThresholdFlow
