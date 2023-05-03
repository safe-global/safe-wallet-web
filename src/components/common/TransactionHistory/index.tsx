import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Typography } from '@mui/material'
import useTxHistory from '@/hooks/useTxHistory'
import styles from './styles.module.css'
import { useEffect, useState } from 'react'
import TxListItem from '@/components/transactions/TxListItem'

const TransactionHistory = () => {
  const txHistory = useTxHistory()
  const [txs, setTxs] = useState<any[]>([])

  useEffect(() => {
    const ts = txHistory.page?.results.filter((tx) => tx.type === 'TRANSACTION') || []
    setTxs(ts)
  }, [txHistory?.page?.results])

  return (
    <Accordion className={styles.accordion} square disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: ({ palette }) => palette.primary.light }} />}
        aria-controls="transactions-content"
        id="transactions-content-header"
      >
        <Box sx={{ display: 'flex', gap: '5px' }}>
          <Typography sx={({ palette }) => ({ color: palette.primary.light, fontWeight: 500 })}>
            Transaction History
          </Typography>
          <Chip label={`${txs?.length}`} size="small" />
        </Box>
      </AccordionSummary>

      {/*todo Displaying stuff here is failing for some reason */}
      <AccordionDetails className={styles.details} style={{ overflowY: 'scroll' }}>
        {txs.length &&
          txs.map((tx, i) => {
            return <TxListItem key={i} item={tx} />
          })}
      </AccordionDetails>
    </Accordion>
  )
}

export default TransactionHistory
