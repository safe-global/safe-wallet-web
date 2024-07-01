import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { ReactElement } from 'react'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import MsgDetails from '@/components/safe-messages/MsgDetails'
import MsgSummary from '@/components/safe-messages/MsgSummary'

import txListItemCss from '@/components/transactions/TxListItem/styles.module.css'

const ExpandableMsgItem = ({ msg, expanded = false }: { msg: SafeMessage; expanded?: boolean }): ReactElement => {
  return (
    <Accordion
      defaultExpanded={expanded}
      disableGutters
      elevation={0}
      className={txListItemCss.accordion}
      sx={{ border: 'none', '&:before': { display: 'none' } }}
    >
      <AccordionSummary
        data-testid="message-item"
        expandIcon={<ExpandMoreIcon />}
        sx={{ justifyContent: 'flex-start', overflowX: 'auto' }}
      >
        <MsgSummary msg={msg} />
      </AccordionSummary>

      <AccordionDetails sx={{ padding: 0 }}>
        <MsgDetails msg={msg} />
      </AccordionDetails>
    </Accordion>
  )
}

export default ExpandableMsgItem
