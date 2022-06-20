import { type ReactElement } from 'react'
import type { Transaction, TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { isConflictHeaderListItem, isLabelListItem, isTransactionListItem } from '@/components/transactions/utils'
import TxSummary from '../TxSummary'
import GroupLabel from '../GroupLabel'
import TxDateLabel from '../TxDateLabel'
import TxDetails from '../TxDetails'
import css from './styles.module.css'

const ExpandibleTransactionItem = ({ item }: { item: Transaction }) => (
  <Accordion
    className={css.accordion}
    sx={{
      '& .MuiAccordionSummary-root': {
        padding: '0px 16px',
      },
      '& .MuiAccordionSummary-root.Mui-expanded': {
        borderBottom: '2px solid #E8E7E6',
      },
    }}
    disableGutters
    TransitionProps={{
      mountOnEnter: false,
      unmountOnExit: true,
    }}
  >
    <AccordionSummary className={css.accordionSummary} expandIcon={<ExpandMoreIcon />}>
      <TxSummary item={item} />
    </AccordionSummary>
    <AccordionDetails className={css.accordionDetails}>
      <TxDetails txSummary={item.transaction} />
    </AccordionDetails>
  </Accordion>
)

type TxListItemProps = {
  item: TransactionListItem
}

const TxListItem = ({ item }: TxListItemProps): ReactElement => {
  return isLabelListItem(item) ? (
    <GroupLabel item={item} />
  ) : isTransactionListItem(item) ? (
    <ExpandibleTransactionItem item={item} />
  ) : isConflictHeaderListItem(item) ? (
    <></> // ignore ConflictHeader
  ) : (
    // TODO: The default should not be DATE_LABEL.
    // We need to add the type guard for it after updating TransactionListItem type in the Client GW SDK
    <TxDateLabel item={item} />
  )
}

export default TxListItem
