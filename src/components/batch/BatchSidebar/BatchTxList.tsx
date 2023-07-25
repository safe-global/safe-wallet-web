import type { DraftBatchItem } from '@/store/batchSlice'
import BatchTxItem from './BatchTxItem'

const BatchTxList = ({ txItems, onDelete }: { txItems: DraftBatchItem[]; onDelete?: (id: string) => void }) => {
  return (
    <>
      {txItems.map((item, index) => (
        <BatchTxItem key={item.txDetails.txId} count={index + 1} {...item} onDelete={onDelete} />
      ))}
    </>
  )
}

export default BatchTxList
