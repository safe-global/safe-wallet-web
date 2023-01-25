import { isSignableBy, isTransactionListItem } from '@/utils/transaction-guards'
import type { TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'

export type SafeTxsActions = {
  queued?: string | number
  signing?: string | number
}

export const addActionsToSafeTxs = (
  chainId: string,
  address: string,
  page: TransactionListPage,
  isSafeOwned: boolean,
  txsActionsByChain: Record<string, Record<string, SafeTxsActions>>,
  walletAddress?: string,
) => {
  if (page.results.length === 0) return txsActionsByChain

  if (isSafeOwned) {
    const txs = page.results.filter(isTransactionListItem)

    txs.reduce((acc, tx) => {
      if (isSignableBy(tx.transaction, walletAddress || '')) {
        acc[chainId] ??= {}
        acc[chainId][address] ??= {}
        acc[chainId][address].signing = Number(acc[chainId]?.[address].signing || 0) + 1
      }
      return acc
    }, txsActionsByChain)
  }

  txsActionsByChain[chainId] = {
    ...(txsActionsByChain[chainId] ?? {}),
    [address]: {
      ...txsActionsByChain[chainId]?.[address],
      queued: `${page.results.filter(isTransactionListItem).length}${page.next ? '+' : ''}`,
    },
  }

  return txsActionsByChain
}
