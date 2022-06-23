import { type ReactElement } from 'react'
import type { Transaction, TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { isDateLabel, isLabelListItem, isTransactionListItem } from '@/components/transactions/utils'
import TxSummary from '../TxSummary'
import GroupLabel from '../GroupLabel'
import TxDateLabel from '../TxDateLabel'
import TxDetails from '../TxDetails'
import css from './styles.module.css'

const ExpandableTransactionItem = ({ item }: { item: Transaction }) => (
  <Accordion
    className={css.accordion}
    sx={({ palette }) => ({
      border: `2px solid ${palette.gray[500]}`,
      '& .MuiAccordionSummary-root.Mui-expanded': {
        borderBottom: `2px solid ${palette.gray[500]}`,
      },
    })}
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
