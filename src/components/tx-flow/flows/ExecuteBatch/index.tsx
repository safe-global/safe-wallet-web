import type { Transaction } from '@safe-global/safe-gateway-typescript-sdk'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import { ReviewBatch } from './ReviewBatch'
import BatchIcon from '@/public/images/apps/batch-icon.svg'

export type ExecuteBatchFlowProps = {
  txs: Transaction[]
}

const ExecuteBatchFlow = (props: ExecuteBatchFlowProps) => {
  return (
    <TxLayout title="Confirm transaction" subtitle="Execute batch" icon={BatchIcon} hideNonce>
      <ReviewBatch params={props} />
    </TxLayout>
  )
}

export default ExecuteBatchFlow
