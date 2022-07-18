import { useMemo, type ReactElement } from 'react'
import {
  DateLabel,
  Transaction,
  TransactionListItem,
  type TransactionListPage,
} from '@gnosis.pm/safe-react-gateway-sdk'
import TxListItem from '../TxListItem'
import { isConflictHeaderListItem, isDateLabel, isTransactionListItem } from '@/utils/transaction-guards'
import GroupedTxListItems from '@/components/transactions/ConflictHeader'
import css from './styles.module.css'

type TxListProps = {
  items: TransactionListPage['results']
}

export const TxListGrid = ({ children }: { children: (ReactElement | null)[] }): ReactElement => {
  return <div className={css.listContainer}>{children}</div>
}

const TxList = ({ items }: TxListProps): ReactElement => {
  let groupedListItems: TransactionListItem[] = []

  // Ensure list always starts with a date label
  const list = useMemo(() => {
    const firstDateLabelIndex = items.findIndex(isDateLabel)
    const firstTxIndex = items.findIndex(isTransactionListItem)
    const shouldPrependDateLabel =
      (firstDateLabelIndex === -1 || firstDateLabelIndex > firstTxIndex) && firstTxIndex !== -1

    if (!shouldPrependDateLabel) {
      return items
    }

    const dateLabel: DateLabel = {
      type: 'DATE_LABEL',
      timestamp: (items[firstTxIndex] as Transaction).transaction.timestamp,
    }

    return [dateLabel, ...items]
  }, [items])

  return (
    <TxListGrid>
      {list.map((item, index) => {
        if (isConflictHeaderListItem(item)) {
          // starts a new groupped list when finds a conflict header list item
          groupedListItems = [item]
          return null
        }
        if (isTransactionListItem(item) && item.conflictType === 'HasNext') {
          groupedListItems = [...groupedListItems, item]
          return null
        }
        if (isTransactionListItem(item) && item.conflictType === 'End') {
          groupedListItems = [...groupedListItems, item]
          return <GroupedTxListItems groupedListItems={groupedListItems} />
        }

        return <TxListItem key={index} item={item} />
      })}
    </TxListGrid>
  )
}

export default TxList
