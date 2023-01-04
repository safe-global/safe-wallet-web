import type { SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
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

  return {
    ...balances,
    balances: {
      items: items.filter((item) => !hiddenTokens.includes(item.tokenInfo.address)),
      fiatTotal,
    },
  }
}
