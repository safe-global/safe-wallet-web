import { type ReactElement } from 'react'
import type { Transaction, TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { isDateLabel, isLabelListItem, isTransactionListItem } from '@/utils/transaction-guards'
import TxSummary from '../TxSummary'
import GroupLabel from '../GroupLabel'
import TxDateLabel from '../TxDateLabel'
import TxDetails from '../TxDetails'
import css from './styles.module.css'

const ExpandableTransactionItem = ({ item }: { item: Transaction }) => (
  <Accordion
    disableGutters
    TransitionProps={{
      mountOnEnter: false,
      unmountOnExit: true,
    }}
    elevation={0}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <TxSummary item={item} />
    </AccordionSummary>
    <AccordionDetails className={css.details}>
      <TxDetails txSummary={item.transaction} />
    </AccordionDetails>
  </Accordion>
)

type TxListItemProps = {
  item: TransactionListItem
}

const TxListItem = ({ item }: TxListItemProps): ReactElement => {
  if (isLabelListItem(item)) {
    return <GroupLabel item={item} />
  }
  if (isTransactionListItem(item)) {
    return <ExpandableTransactionItem item={item} />
  }
  if (isDateLabel(item)) {
    return <TxDateLabel item={item} />
  }
  // ignore ConflictHeader
  return <></>
}
export default TxListItem
