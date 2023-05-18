import ViewTransactionsModal from '@/components/chat/modals/ViewTransactionsModal'
import css from '@/components/chat/styles.module.css'
import useSafeInfo from '@/hooks/useSafeInfo'
import useTxHistory from '@/hooks/useTxHistory'
import { Box, Button, Chip, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

const TransactionHistory = () => {
  const { safe, safeAddress } = useSafeInfo()
  const txHistory = useTxHistory()
  const [txs, setTxs] = useState<any[]>([])
  const [transactionsOpen, toggleTransactionsOpen] = useState<boolean>(false)

  useEffect(() => {
    const ts = txHistory.page?.results.filter((tx) => tx.type === 'TRANSACTION') || []
    setTxs(ts)
  }, [txHistory?.page?.results])

  return (
    // <Link
    //   href={{ pathname: AppRoutes.transactions.history, query: { safe: `${safeAddress}` } }}
    //   key={`${safe}`}
    //   passHref
    // >
    <>
      {transactionsOpen && (
        <ViewTransactionsModal open={transactionsOpen} onClose={() => toggleTransactionsOpen(!transactionsOpen)} />
      )}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: '5px', pb: 2 }}>
          <Typography sx={{ fontWeight: 600 }}>Transaction History</Typography>
          <Chip label={`${txs?.length}`} size="small" />
        </Box>
        <Button
          variant="outlined"
          className={css.buttonstyled}
          onClick={() => toggleTransactionsOpen(!transactionsOpen)}
          size="small"
        >
          View Transactions
        </Button>
      </Box>
    </>
    // </Link>
    // <Accordion className={styles.accordion} square disableGutters>
    //   <AccordionSummary
    //     expandIcon={<ExpandMoreIcon sx={{ color: ({ palette }) => palette.primary.light }} />}
    //     aria-controls="transactions-content"
    //     id="transactions-content-header"
    //   >
    //     <Box sx={{ display: 'flex', gap: '5px' }}>
    //       <Typography sx={({ palette }) => ({ color: palette.primary.light, fontWeight: 500 })}>
    //         Transaction History
    //       </Typography>
    //       <Chip label={`${txs?.length}`} size="small" />
    //     </Box>
    //   </AccordionSummary>

    //   {/*todo Displaying stuff here is failing for some reason */}
    //   <AccordionDetails className={styles.details} style={{ overflowY: 'scroll' }}>
    //     {txs.length &&
    //       txs.map((tx, i) => {
    //         console.log({ tx })
    //         return <TxListItem key={i} item={tx} />
    //       })}
    //   </AccordionDetails>
    // </Accordion>
  )
}

export default TransactionHistory
