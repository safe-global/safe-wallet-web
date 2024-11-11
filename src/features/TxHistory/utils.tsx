import { formatWithSchema } from '@/src/utils/date'
import {
  isConflictHeaderListItem,
  isLabelListItem,
  isNoneConflictType,
  isTransactionListItem,
} from '@/src/utils/transaction-guards'
import { Transaction, TransactionListItem, TransactionListItemType } from '@safe-global/safe-gateway-typescript-sdk'

export interface PendingTxGroup {
  pointer: number
  amount: number
  sections: GroupedTxsWithTitle[]
}

type GroupedTxsItem = TransactionListItem | Transaction[]

export type GroupedTxs = GroupedTxsItem[]

export interface GroupedTxsWithTitle {
  title: string
  data: (Transaction[] | Transaction)[]
}

export const groupTxs = (list: TransactionListItem[]) => {
  const groupedByConflicts = groupConflictingTxs(list)
  const bulkTxs = groupBulkTxs(groupedByConflicts)

  return bulkTxs
}

export const groupPendingTxs = (list: TransactionListItem[]) => {
  const transactions = groupTxs(list)
  const sections = ['Next', 'Queued']
  const txSections = {
    pointer: -1,
    amount: 0,
    sections: [
      { title: 'Ready to execute', data: [] },
      { title: 'Confirmation needed', data: [] },
    ],
  }

  const categorizedTxs = transactions.reduce<PendingTxGroup>((acc, item) => {
    if ('type' in item && isLabelListItem(item)) {
      acc.pointer = sections.indexOf(item.label)
    } else if (
      acc.sections[acc.pointer] &&
      (Array.isArray(item) || item.type === TransactionListItemType.TRANSACTION)
    ) {
      acc.amount += Array.isArray(item) ? item.length : 1
      acc.sections[acc.pointer].data.push(item)
    }

    return acc
  }, txSections)

  return categorizedTxs
}

export const groupTxsByDate = (list: TransactionListItem[]) => {
  return groupByDateLabel(groupTxs(list))
}

/**
 * Group txs by conflict header
 */
export const groupConflictingTxs = (list: TransactionListItem[]): GroupedTxs => {
  return list
    .reduce<GroupedTxs>((resultItems, item) => {
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
    .map((item) => {
      if (Array.isArray(item)) {
        return item.sort((a, b) => b.transaction.timestamp - a.transaction.timestamp)
      }
      return item
    })
}

/**
 * Group txs by tx hash
 */
const groupBulkTxs = (list: GroupedTxs): GroupedTxs => {
  return list
    .reduce<GroupedTxs>((resultItems, item) => {
      if (Array.isArray(item) || !isTransactionListItem(item)) {
        return resultItems.concat([item])
      }
      const currentTxHash = item.transaction.txHash

      const prevItem = resultItems[resultItems.length - 1]
      if (!Array.isArray(prevItem)) return resultItems.concat([[item]])
      const prevTxHash = prevItem[0].transaction.txHash

      if (currentTxHash && currentTxHash === prevTxHash) {
        prevItem.push(item)
        return resultItems
      }

      return resultItems.concat([[item]])
    }, [])
    .map((item) => (Array.isArray(item) && item.length === 1 ? item[0] : item))
}

const groupByDateLabel = (list: GroupedTxs): GroupedTxsWithTitle[] => {
  const groupedTx = list.reduce<GroupedTxsWithTitle[]>((resultItems, item) => {
    if (Array.isArray(item) || item.type === TransactionListItemType.TRANSACTION) {
      resultItems[resultItems.length - 1].data.push(item)
    } else if (item.type === TransactionListItemType.DATE_LABEL) {
      resultItems.push({
        data: [],
        title: formatWithSchema(item.timestamp, 'MMM d, yyyy'),
      })
    }

    return resultItems
  }, [])

  return groupedTx
}
