import { buildQueryFn } from '../utils'
import { PendingTxParams } from './types'
import { getTransactionQueue } from '@safe-global/safe-gateway-typescript-sdk'

export const getPendingTxs = ({ chainId, safeAddress, pageUrl }: PendingTxParams) => {
  return buildQueryFn(() =>
    getTransactionQueue(
      chainId,
      safeAddress,
      {
        trusted: true,
      },
      pageUrl,
    ),
  )
}
