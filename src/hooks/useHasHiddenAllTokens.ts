import { useMemo } from 'react'
import { useVisibleBalances } from './useVisibleBalances'
import useHiddenTokens from './useHiddenTokens'

const useHasHiddenAllTokens = (): boolean => {
  const { balances, loading } = useVisibleBalances()
  const hiddenTokens = useHiddenTokens()

  return useMemo(() => {
    return !loading && hiddenTokens.length > 0 && hiddenTokens.length >= balances.items.length
  }, [loading, balances.items, hiddenTokens])
}

export default useHasHiddenAllTokens
