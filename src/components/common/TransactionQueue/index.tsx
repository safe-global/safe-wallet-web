import useTxQueue from '@/hooks/useTxQueue'
import NoTransactionsIcon from '@/public/images/transactions/no-transactions.svg'
import PendingTxListItem from '../../dashboard/PendingTxs/PendingTxListItem'
import { useState, useEffect } from 'react'
import { Box, List, Typography } from '@mui/material'

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
      <Box sx={{ pt: 3, pl: 3 }}>
        <Typography sx={{ fontWeight: 500 }}>Transaction queue</Typography>
      </Box>
      <List sx={{ pl: 1 }}>
        {queue ? (
          queue.map((transaction: any, i: number) => {
            return <PendingTxListItem transaction={transaction.transaction} key={transaction.transaction.id} />
          })
        ) : (
          <>
            <NoTransactionsIcon />
            <Typography variant="body1" color="primary.light">
              This Safe Account has no queued transactions
            </Typography>
          </>
        )}
      </List>
    </>
  )
}

export default TransactionQueue
