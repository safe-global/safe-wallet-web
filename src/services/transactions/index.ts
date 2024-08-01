import { getModuleTransactions, getTransactionHistory } from '@safe-global/safe-gateway-typescript-sdk'

export const getTimezoneOffset = () => new Date().getTimezoneOffset() * 60 * -1000

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
 * Fetch the ID of a module transaction for the given transaction hash
 */
export const getModuleTransactionId = async (chainId: string, safeAddress: string, txHash: string) => {
  const { results } = await getModuleTransactions(chainId, safeAddress, { transaction_hash: txHash })
  if (results.length === 0) throw new Error('module transaction not found')
  return results[0].transaction.id
}
