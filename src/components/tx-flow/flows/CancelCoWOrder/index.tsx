import TxLayout from '@/components/tx-flow/common/TxLayout'
import CancelCoWOrder from './CancelCoWOrder'
import SwapIcon from '@/public/images/common/swap.svg'

const CancelCowOrderFlow = ({ singleOrderHash }: { singleOrderHash: string }) => {
  return (
    <TxLayout title="Cancel order" subtitle={<>Cancel Order&nbsp;</>} icon={SwapIcon} step={0}>
      <CancelCoWOrder singleOrderHash={singleOrderHash} />
    </TxLayout>
  )
}

export default CancelCowOrderFlow
