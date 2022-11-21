import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { ReactElement } from 'react'

import txListItemCss from '@/components/transactions/TxListItem/styles.module.css'
import MsgSummary from '@/components/messages/MsgSummary'
import type { Message } from '@/hooks/useMessages'

const ExpandableMsgItem = ({ item }: { item: Message }): ReactElement => {
  return (
    <Accordion disableGutters elevation={0} className={txListItemCss.accordion}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ justifyContent: 'flex-start', overflowX: 'auto' }}>
        <MsgSummary item={item} />
      </AccordionSummary>

      <AccordionDetails sx={{ padding: 0 }}>
        <pre>{JSON.stringify(item, null, 3)}</pre>
      </AccordionDetails>
    </Accordion>
  )
}

export default ExpandableMsgItem
