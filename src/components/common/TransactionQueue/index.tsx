import AddNewTxIconButton from '@/components/chat/AddNewTxIconButton'
import NewTxButton from '@/components/chat/NewTxButton'
import useTxQueue from '@/hooks/useTxQueue'
import { Box, List, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PendingTxListItem from '../../dashboard/PendingTxs/PendingTxListItem'

const TransactionQueue = () => {
  const txQueue = useTxQueue()
  const [queue, setQueue] = useState<any>()
  useEffect(() => {
    console.log(txQueue?.page?.results, 'test')
    if (txQueue?.page?.results && txQueue?.page?.results.length > 0) {
      setQueue(txQueue?.page?.results.filter((tx) => tx.type !== 'LABEL'))
    }
  }, [txQueue?.page?.results])
  return (
    <>
      <Box sx={{ pt: 2, pl: 3, pr: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 600 }}>Transaction queue</Typography>
        <AddNewTxIconButton />
      </Box>
      <List sx={{ p: 3, pt: 2 }}>
        {queue ? (
          queue.map((transaction: any, i: number) => {
            return <PendingTxListItem transaction={transaction.transaction} key={transaction.transaction.id} />
          })
        ) : (
          <Box sx={{ border: '1px solid var(--color-border-light)', borderRadius: '4px', pt: 2, pb: 2, pl: 2 }}>
            <Typography pb={1} fontSize="sm" fontWeight={600}>
              No queued up transaction
            </Typography>
            <Typography paragraph fontSize="xs">
              Queue up a transaction by clicking the button below
            </Typography>
            <NewTxButton />
          </Box>
        )}
      </List>
    </>
  )
}

export default TransactionQueue
