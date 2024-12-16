import { useEffect, useRef, useState } from 'react'
import type { TransactionInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { isSwapOrderTxInfo } from '@/utils/transaction-guards'

// https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout#maximum_delay_value
const MAX_TIMEOUT = 2147483647

/**
 * Checks whether a swap has expired and if it hasn't it sets a timeout
 * for the exact moment it will expire
 * @param txInfo
 */
const useIsExpiredSwap = (txInfo: TransactionInfo) => {
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isSwapOrderTxInfo(txInfo)) return

    const checkExpiry = () => {
      const now = Date.now()
      const expiryUnixTimeInMs = txInfo.validUntil * 1000
      const timeUntilExpiry = Math.abs(expiryUnixTimeInMs - now)
      const expiryTime = Math.min(timeUntilExpiry, MAX_TIMEOUT)

      if (now > expiryUnixTimeInMs) {
        setIsExpired(true)
      } else {
        // Set a timeout for the exact moment it will expire
        timerRef.current = setTimeout(() => {
          setIsExpired(true)
        }, expiryTime)
      }
    }

    checkExpiry()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [txInfo])

  return isExpired
}

export default useIsExpiredSwap
