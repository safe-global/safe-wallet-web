import memoize from 'lodash/memoize'
import { getTransactionDetails, getTransactionHistory } from '@safe-global/safe-gateway-typescript-sdk'
import { trimTrailingSlash } from '@/utils/url'

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

/**
 * Fetch the module transaction id from the transaction service providing the transaction hash
 */
export const getModuleTransactionId = async ({
  transactionService,
  safeAddress,
  txHash,
}: {
  transactionService: string
  safeAddress: string
  txHash: string
}) => {
  const url = `${trimTrailingSlash(
    transactionService,
  )}/api/v1/safes/${safeAddress}/module-transactions/?transaction_hash=${txHash}`
  const { results } = await fetch(url).then((res) => {
    if (res.ok && res.status === 200) {
      return res.json() as Promise<any>
    } else {
      throw new Error('Error fetching Safe module transactions')
    }
  })

  if (results.length === 0) throw new Error('module transaction not found')

  return results[0].moduleTransactionId as string
}
