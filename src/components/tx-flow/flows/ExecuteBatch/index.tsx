import type { Transaction } from '@safe-global/safe-gateway-typescript-sdk'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import { ReviewBatch } from './ReviewBatch'

export type ExecuteBatchFlowProps = {
  txs: Transaction[]
}

const ExecuteBatchFlow = (props: ExecuteBatchFlowProps) => {
  return (
    <TxLayout title="Execute batch">
      <ReviewBatch params={props} />
    </TxLayout>
  )
}

export default ExecuteBatchFlow
