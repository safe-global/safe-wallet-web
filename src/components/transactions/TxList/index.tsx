import { useMemo, type ReactElement } from 'react'
import {
  DateLabel,
  Transaction,
  TransactionListItem,
  type TransactionListPage,
} from '@gnosis.pm/safe-react-gateway-sdk'
import TxListItem from '../TxListItem'
import {
  isConflictHeaderListItem,
  isNoneConflictType,
  isTransactionListItem,
  TransactionListItemType,
} from '@/utils/transaction-guards'
import GroupedTxListItems from '@/components/transactions/GroupedTxListItems'
import css from './styles.module.css'
import BatchExecuteButton from '@/components/transactions/BatchExecuteButton'
import { BatchExecuteHoverProvider } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import TxFilterButton from '@/components/transactions/TxFilterButton'
import { useTxFilter } from '@/utils/tx-history-filter'
import isSameDay from 'date-fns/isSameDay'

type TxListProps = {
  items: TransactionListPage['results']
}

export const TxListGrid = ({ children }: { children: (ReactElement | null)[] }): ReactElement => {
  return <div className={css.listContainer}>{children}</div>
}

const TxList = ({ items }: TxListProps): ReactElement => {
  const router = useRouter()
  const [filter] = useTxFilter()

  const list = useMemo(() => {
    if (!filter.type) {
      return items
    }

    // Filtered transaction lists do not contain date labels
    // Prepend initial date label to list
    const firstTxIndex = items.findIndex(isTransactionListItem)

    const dateLabel: DateLabel = {
      type: TransactionListItemType.DATE_LABEL,
      timestamp: (items[firstTxIndex] as Transaction).transaction.timestamp,
    }
    const prependedItems = ([dateLabel] as TransactionListItem[]).concat(items)

    // Insert date labels between transactions on different days
    return prependedItems.reduce<TransactionListItem[]>((resultItems, item, index, allItems) => {
      const prev = resultItems[index - 1]
      const isLastItem = index === allItems.length - 1

      if (
        isLastItem ||
        !prev ||
        !isTransactionListItem(prev) ||
        !isTransactionListItem(item) ||
        // TODO: Make comparison in UTC
        isSameDay(prev.transaction.timestamp, item.transaction.timestamp)
      ) {
        return resultItems.concat(item)
      }

      const dateLabel: DateLabel = {
        type: TransactionListItemType.DATE_LABEL,
        timestamp: item.transaction.timestamp,
      }
      return resultItems.concat(dateLabel)
    }, [])
  }, [items, filter.type])

  const listWithGroupedItems: (TransactionListItem | Transaction[])[] = useMemo(() => {
    return list.reduce((acc: (TransactionListItem | Transaction[])[], current, i) => {
      if (isConflictHeaderListItem(current)) {
        return acc.concat([[]])
      }

      const prev = acc[i - 1]
      if (Array.isArray(prev) && isTransactionListItem(current) && !isNoneConflictType(current)) {
        prev.push(current)
        return acc
      }

      return acc.concat(current)
    }, [])
  }, [list])

  const isQueue = router.pathname === AppRoutes.safe.transactions.queue

  return (
    <>
      <BatchExecuteHoverProvider>
        {isQueue ? (
          <BatchExecuteButton items={listWithGroupedItems} className={css.button} />
        ) : (
          <TxFilterButton className={css.button} />
        )}
        <TxListGrid>
          {listWithGroupedItems.map((item, index) => {
            if (Array.isArray(item)) {
              return <GroupedTxListItems key={index} groupedListItems={item} />
            }

            return <TxListItem key={index} item={item} />
          })}
        </TxListGrid>
      </BatchExecuteHoverProvider>
    </>
  )
}

export default TxList
