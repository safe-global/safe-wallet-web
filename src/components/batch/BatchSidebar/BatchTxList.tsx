import { Reorder } from 'framer-motion'
import type { DraftBatchItem } from '@/store/batchSlice'
import BatchTxItem from './BatchTxItem'

const BatchTxList = ({ txItems, onDelete }: { txItems: DraftBatchItem[]; onDelete?: (id: string) => void }) => {
  return (
    <>
      {txItems.map((item, index) => (
        <BatchTxItem key={item.id} count={index + 1} {...item} onDelete={onDelete} />
      ))}
    </>
  )
}

export const BatchReorder = ({
  txItems,
  onDelete,
  onReorder,
}: {
  txItems: DraftBatchItem[]
  onDelete?: (id: string) => void
  onReorder: (items: DraftBatchItem[]) => void
}) => {
  return (
    <Reorder.Group axis="y" values={txItems} onReorder={onReorder}>
      {txItems.map((item, index) => (
        <Reorder.Item key={item.id} value={item}>
          <BatchTxItem count={index + 1} {...item} onDelete={onDelete} draggable />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}

export default BatchTxList
