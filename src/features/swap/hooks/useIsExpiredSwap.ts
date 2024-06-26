import { useEffect, useState } from 'react'
import type { TransactionInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { isSwapOrderTxInfo } from '@/utils/transaction-guards'
import useIntervalCounter from '@/hooks/useIntervalCounter'

const INTERVAL_IN_MS = 10_000

/**
 * Checks the expiry time of a swap every 10s
 * and returns true if the swap expired
 * @param txInfo
 */
const useIsExpiredSwap = (txInfo: TransactionInfo) => {
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const [counter] = useIntervalCounter(INTERVAL_IN_MS)

  useEffect(() => {
    if (!isSwapOrderTxInfo(txInfo)) return

    setIsExpired(Date.now() > txInfo.validUntil * 1000)
  }, [counter, txInfo])

  return isExpired
}

export default useIsExpiredSwap
