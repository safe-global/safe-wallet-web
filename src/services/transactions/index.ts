import memoize from 'lodash/memoize'
import { getTransactionDetails, getTransactionHistory } from '@safe-global/safe-gateway-typescript-sdk'

/**
 * Fetch and memoize transaction details from Safe Gateway
 *
 * @param chainId Chain id
 * @param id Transaction id or hash
 * @returns Transaction details
 */
export const getTxDetails = memoize(
  (chainId: string, id: string) => {
    return getTransactionDetails(chainId, id)
  },
  (id: string, chainId: string) => `${chainId}-${id}`,
)

export const getTxHistory = (chainId: string, safeAddress: string, pageUrl?: string) => {
  return getTransactionHistory(
    chainId,
    safeAddress,
    {
      timezone_offset: new Date().getTimezoneOffset() * 60 * 1000, // used for grouping txs by date
      trusted: false, // load all transactions, mark untrusted in the UI
    },
    pageUrl,
  )
}
