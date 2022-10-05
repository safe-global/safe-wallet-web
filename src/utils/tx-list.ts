import type { Transaction, TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import { isConflictHeaderListItem, isNoneConflictType, isTransactionListItem } from '@/utils/transaction-guards'

type GroupedTxs = Array<TransactionListItem | Transaction[]>

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
