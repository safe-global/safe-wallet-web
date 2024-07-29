import { useEffect, useRef, useState } from 'react'
import type { TransactionInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { isSwapOrderTxInfo } from '@/utils/transaction-guards'

/**
 * Checks the expiry time of a swap every 10s
 * and returns true if the swap expired
 * @param txInfo
 */
const useIsExpiredSwap = (txInfo: TransactionInfo) => {
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isSwapOrderTxInfo(txInfo)) return

    const checkExpiry = () => {
      const now = Date.now()
      const expiryTime = txInfo.validUntil * 1000

      if (now > expiryTime) {
        setIsExpired(true)
      } else {
        // Set a timeout for the exact moment it will expire
        timerRef.current = setTimeout(() => {
          setIsExpired(true)
        }, expiryTime - now)
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
