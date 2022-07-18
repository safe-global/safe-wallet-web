import { useMemo, type ReactElement } from 'react'
import {
  DateLabel,
  Transaction,
  TransactionListItem,
  type TransactionListPage,
} from '@gnosis.pm/safe-react-gateway-sdk'
import TxListItem from '../TxListItem'
import { isConflictHeaderListItem, isDateLabel, isTransactionListItem } from '@/utils/transaction-guards'
import css from './styles.module.css'
import ConflictHeader from '@/components/transactions/ConflictHeader'

type TxListProps = {
  items: TransactionListPage['results']
}

export const TxListGrid = ({ children }: { children: (ReactElement | null)[] }): ReactElement => {
  return <div className={css.listContainer}>{children}</div>
}

const TxList = ({ items }: TxListProps): ReactElement => {
  let grouppedListItems: TransactionListItem[] = []

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
          grouppedListItems = [item]
          return null
        }
        if (isTransactionListItem(item) && item.conflictType === 'HasNext') {
          grouppedListItems = [...grouppedListItems, item]
          return null
        }
        if (isTransactionListItem(item) && item.conflictType === 'End') {
          grouppedListItems = [...grouppedListItems, item]
          return <ConflictHeader grouppedListItems={grouppedListItems} />
        }

        return <TxListItem key={index} item={item} />
      })}
    </TxListGrid>
  )
}

export default TxList
