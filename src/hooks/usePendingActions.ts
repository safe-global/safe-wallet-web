import { isTransactionListItem } from "@/utils/transaction-guards"
import { isSignableBy } from "@/utils/transaction-guards"
import { getTransactionQueue, TransactionListPage } from "@safe-global/safe-gateway-typescript-sdk"
import { useMemo } from "react"
import useAsync from "./useAsync"
import useSafeInfo from "./useSafeInfo"
import useTxQueue from "./useTxQueue"
import useWallet from "./wallets/useWallet"

type PendingActions = {
  totalQueued: string
  totalToSign: string
}

const getSignableCount = (queue: TransactionListPage, walletAddress: string): number => {
  return queue.results.filter(tx => isTransactionListItem(tx) && isSignableBy(tx.transaction, walletAddress)).length
}

const usePendingActions = (chainId: string, safeAddress: string): PendingActions => {
  const wallet = useWallet()
  const { safeAddress: currentSafeAddress } = useSafeInfo()
  const { page: currentSafeQueue } = useTxQueue()
  const isCurrentSafe = currentSafeAddress === safeAddress

  // TODO: Don't load for current safe
  const [loadedQueue] = useAsync<TransactionListPage>(
    () => {
      if (isCurrentSafe) return
      return getTransactionQueue(chainId, safeAddress)
    }, [chainId, safeAddress, isCurrentSafe]
  )

  const queue = isCurrentSafe ? currentSafeQueue : loadedQueue

  return useMemo(() => ({
    // Return +10 if more than one page, otherwise just the length
    totalQueued: queue ? (queue.next ? '+' : '') + (queue.results.length || '') : '',
    // Return the queued txs signable by wallet
    totalToSign: queue ? (getSignableCount(queue, wallet?.address || '') || '').toString() : ''
  }), [queue, wallet])
}

export default usePendingActions
