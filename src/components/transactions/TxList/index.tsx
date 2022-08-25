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
  isDateLabel,
  isNoneConflictType,
  isTransactionListItem,
} from '@/utils/transaction-guards'
import GroupedTxListItems from '@/components/transactions/GroupedTxListItems'
import css from './styles.module.css'
import BatchExecuteButton from '@/components/transactions/BatchExecuteButton'
import { BatchExecuteHoverProvider } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import TxFilterButton from '@/components/transactions/TxFilterButton'

type TxListProps = {
  items: TransactionListPage['results']
}

export const TxListGrid = ({ children }: { children: (ReactElement | null)[] }): ReactElement => {
  return <div className={css.listContainer}>{children}</div>
}

const TxList = ({ items }: TxListProps): ReactElement => {
  const router = useRouter()
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

  const listWithGroupedItems: (TransactionListItem | Transaction[])[] = useMemo(() => {
    return list.reduce((acc: (TransactionListItem | Transaction[])[], current) => {
      if (isConflictHeaderListItem(current)) {
        return [...acc, []]
      }

      const prev = acc[acc.length - 1]
      if (Array.isArray(prev) && isTransactionListItem(current) && !isNoneConflictType(current)) {
        prev.push(current)
        return acc
      }

      return [...acc, current]
    }, [])
  }, [list])

  const isQueue = router.pathname === AppRoutes.safe.transactions.queue

  return (
    <>
      <BatchExecuteHoverProvider>
        {isQueue ? <BatchExecuteButton items={listWithGroupedItems} /> : <TxFilterButton />}
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
