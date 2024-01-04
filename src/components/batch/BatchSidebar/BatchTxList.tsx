import type { DraftBatchItem } from '@/store/batchSlice'
import BatchTxItem from './BatchTxItem'
import { List } from '@mui/material'

const BatchTxList = ({ txItems, onDelete }: { txItems: DraftBatchItem[]; onDelete?: (id: string) => void }) => {
  return (
    <>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {txItems.map((item, index) => (
          <BatchTxItem key={item.id} count={index + 1} {...item} onDelete={onDelete} />
        ))}
      </List>
    </>
  )
}

export default BatchTxList
