import { useEffect, useMemo } from 'react'

import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { gtmSetAbTest } from '@/services/analytics/gtm'
import type { AbTest } from '@/services/analytics/gtm'

const useABTesting = (abTest: AbTest): boolean => {
  // Fallback AB test value if no `localStorage` exists
  const coinToss = useMemo(() => {
    return Math.random() >= 0.5
  }, [])

  const [isB = coinToss, setIsB] = useLocalStorage<boolean>(`AB_${abTest}`)

  // Save fallback value to `localStorage` if no cache exists
  useEffect(() => {
    setIsB((prev) => prev ?? coinToss)
  }, [coinToss, isB, setIsB])

  // Store AB test value in GTM
  useEffect(() => {
    if (isB) {
      gtmSetAbTest(abTest)
    }
  }, [abTest, isB])

  return isB
}

export default useABTesting
