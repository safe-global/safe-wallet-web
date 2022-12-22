import { useMemo } from 'react'
import isEqual from 'lodash/isEqual'
import { type SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import { selectBalances } from '@/store/balancesSlice'
import useHiddenTokens from './useHiddenTokens'
import { safeFormatUnits, safeParseUnits } from '@/utils/formatters'
import { BigNumber } from 'ethers'

const filterHiddenBalances = (balances: SafeBalanceResponse, hiddenAssets: string[]): SafeBalanceResponse => {
  const fiatTotalVisible = safeFormatUnits(
    balances.items
      .reduce((acc, balanceItem) => {
        if (hiddenAssets.includes(balanceItem.tokenInfo.address)) {
          return acc.sub(safeParseUnits(balanceItem.fiatBalance, 18) || 0)
        }
        return acc
      }, BigNumber.from(!balances || balances.fiatTotal === '' ? 0 : safeParseUnits(balances.fiatTotal, 18)))
      .toString(),
    18,
  )

  const balanceItemsVisible = balances.items.filter(
    (balanceItem) => !hiddenAssets.includes(balanceItem.tokenInfo.address),
  )

  return { fiatTotal: fiatTotalVisible, items: balanceItemsVisible }
}

const useBalances = (
  includeHidden = false,
): {
  balances: SafeBalanceResponse
  loading: boolean
  error?: string
} => {
  const state = useAppSelector(selectBalances, isEqual)
  const hiddenAssets = useHiddenTokens()
  const { data, error, loading } = state

  return useMemo(
    () => ({
      balances: includeHidden ? data : filterHiddenBalances(data, hiddenAssets || {}),
      error,
      loading,
    }),
    [includeHidden, data, hiddenAssets, error, loading],
  )
}

export default useBalances
