import { isSignableBy, isTransactionListItem } from '@/utils/transaction-guards'
import type { TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'

export type SafeTxsActions = {
  queued?: string | number
  signing?: string | number
}

export type PendingActionsByChain = {
  [chainId: string]: { [safeAddress: string]: SafeTxsActions }
}

export const addPendingActionsByChain = (
  chainId: string,
  address: string,
  page: TransactionListPage,
  isSafeOwned: boolean,
  pendingActionsByChain: PendingActionsByChain,
  walletAddress?: string,
) => {
  if (page.results.length === 0) return pendingActionsByChain

  const txs = page.results.filter(isTransactionListItem)

  // If owner of Safe, add number of signable transactions
  if (isSafeOwned) {
    pendingActionsByChain = txs.reduce((acc, tx) => {
      if (isSignableBy(tx.transaction, walletAddress || '')) {
        acc[chainId] ??= {}
        acc[chainId][address] ??= {}
        acc[chainId][address].signing = Number(acc[chainId][address].signing || 0) + 1
      }
      return acc
    }, pendingActionsByChain)
  }

  // Always add number of queued transactions
  pendingActionsByChain[chainId] ??= {}
  pendingActionsByChain[chainId][address] ??= {}
  pendingActionsByChain[chainId][address].queued = `${txs.length}${page.next ? '+' : ''}`

  return pendingActionsByChain
}
