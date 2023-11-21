import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { ReactElement } from 'react'

import txListItemCss from '@/components/transactions/TxListItem/styles.module.css'
import { RecoverySummary } from '../RecoverySummary'
import { RecoveryDetails } from '../RecoveryDetails'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

export function RecoveryListItem({ item }: { item: RecoveryQueueItem }): ReactElement {
  return (
    <Accordion disableGutters elevation={0} className={txListItemCss.accordion}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ justifyContent: 'flex-start', overflowX: 'auto' }}>
        <RecoverySummary item={item} />
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        <RecoveryDetails item={item} />
      </AccordionDetails>
    </Accordion>
  )
}
