import BatchTxList from '@/components/batch/BatchSidebar/BatchTxList'
import { useDraftBatch } from '@/hooks/useDraftBatch'

function BatchTransactions() {
  const batchTxs = useDraftBatch()

  return <BatchTxList txItems={batchTxs} />
}

export default BatchTransactions
