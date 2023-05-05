import { Box, Chip, Typography } from '@mui/material'
import useTxHistory from '@/hooks/useTxHistory'
import { useEffect, useState } from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { AppRoutes } from '@/config/routes'
import useSafeInfo from '@/hooks/useSafeInfo'
import Link from 'next/link'

const TransactionHistory = () => {
  const { safe, safeAddress } = useSafeInfo()
  const txHistory = useTxHistory()
  const [txs, setTxs] = useState<any[]>([])

  useEffect(() => {
    const ts = txHistory.page?.results.filter((tx) => tx.type === 'TRANSACTION') || []
    setTxs(ts)
  }, [txHistory?.page?.results])

  return (
    <Link
      href={{ pathname: AppRoutes.transactions.history, query: { safe: `${safeAddress}` } }}
      key={`${safe}`}
      passHref
    >
      <Box sx={{ display: 'flex', gap: '5px', p: 2, cursor: 'pointer' }}>
        <Typography sx={({ palette }) => ({ color: palette.primary.light, fontWeight: 500 })}>
          Transaction History
        </Typography>
        <Chip label={`${txs?.length}`} size="small" />
        <OpenInNewIcon sx={({ palette }) => ({ color: palette.primary.light })} />
      </Box>
    </Link>
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
