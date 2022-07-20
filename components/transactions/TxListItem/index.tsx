import { type ReactElement, useContext } from 'react'
import type { Transaction, TransactionDetails, TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  isCreationTxInfo,
  isDateLabel,
  isLabelListItem,
  isNoneConflictType,
  isTransactionListItem,
} from '@/utils/transaction-guards'
import TxSummary from '@/components/transactions/TxSummary'
import GroupLabel from '@/components/transactions/GroupLabel'
import TxDateLabel from '@/components/transactions/TxDateLabel'
import TxDetails from '@/components/transactions/TxDetails'
import CreateTxInfo from '@/components/transactions/SafeCreationTx'
import { TxHoverContext } from '@/components/transactions/GroupedTxListItems/TxHoverProvider'
import css from './styles.module.css'

interface ExpandableTransactionItemProps {
  isGrouped?: boolean
  item: Transaction
  txDetails?: TransactionDetails
}

export const ExpandableTransactionItem = ({ isGrouped = false, item, txDetails }: ExpandableTransactionItemProps) => {
  const { activeHover } = useContext(TxHoverContext)
  console.log(activeHover)
  return (
    <Accordion
      disableGutters
      TransitionProps={{
        mountOnEnter: false,
        unmountOnExit: true,
      }}
      elevation={0}
      defaultExpanded={!!txDetails}
      className={activeHover && activeHover !== item.transaction.id ? css.willBeReplaced : ''}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ justifyContent: 'flex-start', overflowX: 'auto' }}>
        <TxSummary item={item} isGrouped={isGrouped} />
      </AccordionSummary>

      <AccordionDetails sx={{ padding: 0 }}>
        {isCreationTxInfo(item.transaction.txInfo) ? (
          <CreateTxInfo txSummary={item.transaction} />
        ) : (
          <TxDetails txSummary={item.transaction} txDetails={txDetails} />
        )}
      </AccordionDetails>
    </Accordion>
  )
}

type TxListItemProps = {
  item: TransactionListItem
}

const TxListItem = ({ item }: TxListItemProps): ReactElement | null => {
  if (isLabelListItem(item)) {
    return <GroupLabel item={item} />
  }
  if (isTransactionListItem(item) && isNoneConflictType(item)) {
    return <ExpandableTransactionItem item={item} />
  }
  if (isDateLabel(item)) {
    return <TxDateLabel item={item} />
  }
  return null
}

export default TxListItem
