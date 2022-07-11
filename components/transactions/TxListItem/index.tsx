import { type ReactElement } from 'react'
import type { Transaction, TransactionDetails, TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { isCreationTxInfo, isDateLabel, isLabelListItem, isTransactionListItem } from '@/utils/transaction-guards'
import TxSummary from '@/components/transactions/TxSummary'
import GroupLabel from '@/components/transactions/GroupLabel'
import TxDateLabel from '@/components/transactions/TxDateLabel'
import TxDetails from '@/components/transactions/TxDetails'
import CreateTxInfo from '@/components/transactions/Create'

export const ExpandableTransactionItem = ({
  item,
  txDetails,
}: {
  item: Transaction
  txDetails?: TransactionDetails
}) => (
  <Accordion
    disableGutters
    TransitionProps={{
      mountOnEnter: false,
      unmountOnExit: true,
    }}
    elevation={0}
    defaultExpanded={!!txDetails}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <TxSummary item={item} />
    </AccordionSummary>

    <AccordionDetails sx={{ padding: 0 }}>
      {isCreationTxInfo(item.transaction.txInfo) ? (
        <CreateTxInfo timestamp={item.transaction.timestamp} txInfo={item.transaction.txInfo} />
      ) : (
        <TxDetails txSummary={item.transaction} txDetails={txDetails} />
      )}
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
