import { useMemo } from 'react'
import { useVisibleBalances } from './useVisibleBalances'
import useHiddenTokens from './useHiddenTokens'

const useHasHiddenAllTokens = (): boolean => {
  const { balances } = useVisibleBalances()
  const hiddenTokens = useHiddenTokens()

  return useMemo(() => {
    return balances.items.length > 0 && hiddenTokens.length > 0 && balances.items.length === hiddenTokens.length
  }, [balances.items, hiddenTokens])
}

export default useHasHiddenAllTokens
