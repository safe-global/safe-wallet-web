import memoize from 'lodash/memoize'
import { getTransactionDetails, getTransactionHistory } from '@safe-global/safe-gateway-typescript-sdk'

export const getTimezoneOffset = () => new Date().getTimezoneOffset() * 60 * -1000

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

export const getTxHistory = (chainId: string, safeAddress: string, trusted = false, pageUrl?: string) => {
  return getTransactionHistory(
    chainId,
    safeAddress,
    {
      timezone_offset: getTimezoneOffset(), // used for grouping txs by date
      trusted, // if false, load all transactions, mark untrusted in the UI
    },
    pageUrl,
  )
}
