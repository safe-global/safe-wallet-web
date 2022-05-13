import { type ReactElement } from 'react'
import type { ConflictHeader, DateLabel, Label, Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import TxSummary from '../TxSummary'
import GroupLabel from '../GroupLabel'
import TxDateLabel from '../TxDateLabel'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

type TxListItemProps = {
  item: Transaction | DateLabel | Label | ConflictHeader
}

const TxListItem = ({ item }: TxListItemProps): ReactElement => {
  switch (item.type) {
    case 'LABEL':
      return <GroupLabel item={item} />
    case 'DATE_LABEL':
      return <TxDateLabel item={item} />
    case 'TRANSACTION':
      return (
        <Accordion
          sx={{
            border: '2px solid #EEEFF0',
            borderRadius: '8px',
            '& .MuiAccordionSummary-root': {
              padding: '0px 16px',
            },
            boxShadow: 'unset',
            '&::before': {
              content: 'none',
            },
          }}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              padding: 0,
              '& .MuiAccordionSummary-content': {
                margin: 0,
              },
            }}
          >
            <TxSummary item={item} />
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit
              leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
      )
    default:
      return <></> // ignore ConflictHeader
  }
}

export default TxListItem
