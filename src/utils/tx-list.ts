import { TransactionInfoType } from '@safe-global/safe-gateway-typescript-sdk'
import type { Transaction, TransactionListItem } from '@safe-global/safe-gateway-typescript-sdk'

import { isConflictHeaderListItem, isNoneConflictType, isTransactionListItem } from '@/utils/transaction-guards'
import { sameAddress } from './addresses'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'

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

/**
 * Group txs by tx hash
 */
export const groupBulkTxs = (list: GroupedTxs, txHashes: Record<string, string> | undefined): GroupedTxs => {
  if (!txHashes) return list
  // ): Promise<Array<txWithDetails | txWithDetails[]>> => {

  return list
    .reduce<GroupedTxs>((resultItems, item) => {
      // Leave conflict groups and non transaction types as is
      if (Array.isArray(item) || !isTransactionListItem(item)) {
        return resultItems.concat([item])
      }
      const currentTxId = item.transaction.id
      const currentTxHash = txHashes[currentTxId]

      const prevItem = resultItems[resultItems.length - 1]
      if (!Array.isArray(prevItem)) return resultItems.concat([[item]])

      const prevTxId = prevItem[0].transaction.id
      const prevTxHash = txHashes[prevTxId]

      if (currentTxHash === prevTxHash) {
        prevItem.push(item)
        return resultItems
      }

      return resultItems.concat([[item]])
    }, [])
    .map((item) => (Array.isArray(item) && item.length === 1 ? item[0] : item))
  // return list.entries().map((listItem) => {
  //   if (!isTransactionListItem(listItem)) return listItem

  //   const txId = listItem.transaction.id
  //   const txHash = txHashes[txId]
  // })

  // const transactions = list.filter(isTransactionListItem)
  // return null
  // return transactions
  //   .reduce<Array<txWithDetails | txWithDetails[]>>((resultItems, item) => {
  //     const { listItem, transactionDetails } = item
  //     const isConflictGroup = Array.isArray(item)
  //     const transactionHash = isConflictGroup ? item[0].transactionDetails.txHash : transactionDetails?.txHash
  //     if (!transactionHash) {
  //       resultItems[listItem.] = item
  //       return resultItems
  //     }

  //     if (isConflictGroup) {
  //       resultItems[transactionHash] = item
  //       return resultItems
  //     }

  //     const executionGroup = resultItems.find(
  //       (group) => Array.isArray(group) && group.length > 0 && group[0].transactionDetails?.txHash === transactionHash,
  //     )
  //     if (Array.isArray(executionGroup)) {
  //       executionGroup.push(item)
  //       return resultItems
  //     }

  //     return resultItems.concat([[item]])
  //   }, {})
  //   .map((item) => (Array.isArray(item) && item.length === 1 ? item[0] : item))
}

export function _getRecoveryCancellations(moduleAddress: string, transactions: Array<Transaction>) {
  const CANCELLATION_TX_METHOD_NAME = 'setTxNonce'

  return transactions.filter(({ transaction }) => {
    const { txInfo } = transaction
    return (
      txInfo.type === TransactionInfoType.CUSTOM &&
      sameAddress(txInfo.to.value, moduleAddress) &&
      txInfo.methodName === CANCELLATION_TX_METHOD_NAME
    )
  })
}

type GroupedRecoveryQueueItem = Transaction | RecoveryQueueItem

export function groupRecoveryTransactions(queue: Array<TransactionListItem>, recoveryQueue: Array<RecoveryQueueItem>) {
  const transactions = queue.filter(isTransactionListItem)

  return recoveryQueue.reduce<Array<RecoveryQueueItem | Array<GroupedRecoveryQueueItem>>>((acc, item) => {
    const cancellations = _getRecoveryCancellations(item.address, transactions)

    if (cancellations.length === 0) {
      acc.push(item)
    } else {
      acc.push([item, ...cancellations])
    }

    return acc
  }, [])
}

export const getLatestTransactions = (list: TransactionListItem[] = []): Transaction[] => {
  return (
    groupConflictingTxs(list)
      // Get latest transaction if there are conflicting ones
      .map((group) => (Array.isArray(group) ? group[0] : group))
      .filter(isTransactionListItem)
  )
}
