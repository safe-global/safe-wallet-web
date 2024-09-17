import { getModuleTransactions, getTransactionHistory } from '@safe-global/safe-gateway-typescript-sdk'

export const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

export const getTxHistory = (
  chainId: string,
  safeAddress: string,
  hideUntrustedTxs: boolean,
  hideImitationTxs: boolean,
  pageUrl?: string,
) => {
  return getTransactionHistory(
    chainId,
    safeAddress,
    {
      timezone: getTimezone(), // used for grouping txs by date
      // Untrusted and imitation txs are filtered together in the UI
      trusted: hideUntrustedTxs, // if false, include transactions marked untrusted in the UI
      imitation: !hideImitationTxs, // If true, include transactions marked imitation in the UI
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
