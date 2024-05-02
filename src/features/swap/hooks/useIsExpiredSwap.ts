import { useState } from 'react'
import type { TransactionInfo } from '@safe-global/safe-gateway-typescript-sdk'
import useInterval from '@/hooks/useInterval'
import { isSwapTxInfo } from '@/utils/transaction-guards'

const INTERVAL_IN_MS = 10_000

/**
 * Checks the expiry time of a swap every 10s
 * and returns true if the swap expired
 * @param txInfo
 */
const useIsExpiredSwap = (txInfo: TransactionInfo) => {
  const [isExpired, setIsExpired] = useState<boolean>(false)

  const isExpiredSwap = () => {
    if (!isSwapTxInfo(txInfo)) return

    setIsExpired(Date.now() > txInfo.validUntil * 1000)
  }

  useInterval(isExpiredSwap, INTERVAL_IN_MS)

  return isExpired
}

export default useIsExpiredSwap
