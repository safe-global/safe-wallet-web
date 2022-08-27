import { useMemo } from 'react'
import type {
  DateLabel,
  Transaction,
  TransactionListItem,
  TransactionListPage,
} from '@gnosis.pm/safe-react-gateway-sdk'
import isSameDay from 'date-fns/isSameDay'

import {
  isConflictHeaderListItem,
  isNoneConflictType,
  isTransactionListItem,
  TransactionListItemType,
} from '@/utils/transaction-guards'
import { useTxFilter } from '@/utils/tx-history-filter'

export type GroupedTxs = Array<TransactionListItem | Transaction[]>

// TODO: Test
const groupTxItems = (list: TransactionListItem[]): GroupedTxs => {
  return list.reduce<GroupedTxs>((resultItems, item) => {
    if (isConflictHeaderListItem(item)) {
      return resultItems.concat([[]])
    }

    const prevItem = resultItems[resultItems.length - 1]
    if (Array.isArray(prevItem) && isTransactionListItem(item) && !isNoneConflictType(item)) {
      prevItem.push(item)
      return resultItems
    }

    return resultItems.concat(item)
  }, [])
}

// TODO: Test
const addDateLabels = (items: TransactionListItem[]): TransactionListItem[] => {
  const firstTx = items.find(isTransactionListItem)

  if (!items.length || !firstTx) {
    return items
  }

  // Filtered transaction lists do not contain date labels
  // Prepend initial date label to list
  const dateLabel: DateLabel = {
    type: TransactionListItemType.DATE_LABEL,
    timestamp: firstTx.transaction.timestamp,
  }
  const prependedItems = ([dateLabel] as TransactionListItem[]).concat(items)

  // Insert date labels between transactions on different days
  return prependedItems.reduce<TransactionListItem[]>((resultItems, item, index, allItems) => {
    const prevItem = allItems[index - 1]

    if (
      !prevItem ||
      !isTransactionListItem(prevItem) ||
      !isTransactionListItem(item) ||
      // TODO: Make comparison in UTC
      isSameDay(prevItem.transaction.timestamp, item.transaction.timestamp)
    ) {
      return resultItems.concat(item)
    }

    const dateLabel: DateLabel = {
      type: TransactionListItemType.DATE_LABEL,
      timestamp: item.transaction.timestamp,
    }
    return resultItems.concat(dateLabel, item)
  }, [])
}

/**
 * Format transaction results to include date labels where appropriate
 * and group conflicting transactions
 */
const useGroupedTxs = (items: TransactionListPage['results']) => {
  const [filter] = useTxFilter()

  const list = useMemo(() => {
    return filter ? addDateLabels(items) : items
  }, [items, filter])

  return useMemo(() => {
    return groupTxItems(list)
  }, [list])
}

export default useGroupedTxs
