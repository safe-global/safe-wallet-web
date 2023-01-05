import type { SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { useMemo } from 'react'
import useBalances from './useBalances'
import useHiddenTokens from './useHiddenTokens'

export const useVisibleBalances = (): {
  balances: SafeBalanceResponse
  loading: boolean
  error?: string
} => {
  const balances = useBalances()
  const hiddenTokens = useHiddenTokens()
  const { items, fiatTotal } = balances.balances

  return useMemo(
    () => ({
      ...balances,
      balances: {
        items: items.filter((item) => !hiddenTokens.includes(item.tokenInfo.address)),
        fiatTotal,
      },
    }),
    [balances, fiatTotal, hiddenTokens, items],
  )
}
