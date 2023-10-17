import memoize from 'lodash/memoize'
import { getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'

/**
 * Fetch and memoize transaction details from Safe Gateway
 *
 * @param id Transaction id or hash
 * @param chainId Chain id
 * @returns Transaction details
 */
export const getTxDetails = memoize(
  (id: string, chainId: string) => {
    return getTransactionDetails(id, chainId)
  },
  (id: string, chainId: string) => `${id}-${chainId}`,
)
