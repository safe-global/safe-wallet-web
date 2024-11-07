import { getTransactionHistory } from '@safe-global/safe-gateway-typescript-sdk'
import { buildQueryFn } from '../utils'
import { TxHistoryListParams } from './types'

export const getTxHistoryList = ({ chainId, safeAddress, pageUrl }: TxHistoryListParams) => {
  return buildQueryFn(() =>
    getTransactionHistory(
      chainId,
      safeAddress,
      {
        trusted: false,
      },
      pageUrl,
    ),
  )
}
