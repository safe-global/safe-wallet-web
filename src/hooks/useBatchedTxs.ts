import type { Transaction, TransactionListItem } from '@safe-global/safe-gateway-typescript-sdk'
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import { useMemo } from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import { groupConflictingTxs } from '@/utils/tx-list'

const BATCH_LIMIT = 20

export const getBatchableTransactions = (items: TransactionListItem[], nonce: number) => {
  const batchableTransactions: Transaction[] = []
  let currentNonce = nonce

  const grouped = groupConflictingTxs(items)
    .map((item) => {
      if (Array.isArray(item)) return item
      if (isTransactionListItem(item)) return [item]
    })
    .filter(Boolean) as Transaction[][]

  grouped.forEach((txs) => {
    const sorted = txs.slice().sort((a, b) => b.transaction.timestamp - a.transaction.timestamp)
    sorted.forEach((tx) => {
      if (!isMultisigExecutionInfo(tx.transaction.executionInfo)) return

      const { nonce, confirmationsSubmitted, confirmationsRequired } = tx.transaction.executionInfo
      if (
        batchableTransactions.length < BATCH_LIMIT &&
        nonce === currentNonce &&
        confirmationsSubmitted >= confirmationsRequired
      ) {
        batchableTransactions.push(tx)
        currentNonce = nonce + 1
      }
    })
  })

  return batchableTransactions
}

const useBatchedTxs = (items: TransactionListItem[]) => {
  const { safe } = useSafeInfo()
  const currentNonce = safe.nonce

  return useMemo(() => getBatchableTransactions(items, currentNonce), [currentNonce, items])
}

export default useBatchedTxs
