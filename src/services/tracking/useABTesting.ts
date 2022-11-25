import { useEffect, useMemo } from 'react'

import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { setAbTest } from './abTesting'
import type { AbTest } from './abTesting'

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
      setAbTest(abTest)
    }
  }, [abTest, isB])

  return isB
}

export default useABTesting
