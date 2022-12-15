import { useMemo } from 'react'
import isEqual from 'lodash/isEqual'
import { type SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import { selectBalances } from '@/store/balancesSlice'
import type { HiddenAssetsOnChain } from '@/store/hiddenAssetsSlice'
import useHiddenAssets from './useHiddenAssets'
import { safeFormatUnits, safeParseUnits } from '@/utils/formatters'
import { BigNumber } from 'ethers'

const removeHiddenBalances = (
  balances: SafeBalanceResponse,
  hiddenAssets: HiddenAssetsOnChain,
): SafeBalanceResponse => {
  const fiatTotalVisible = safeFormatUnits(
    balances.items
      .reduce((acc, balanceItem) => {
        if (typeof hiddenAssets?.[balanceItem.tokenInfo.address] !== 'undefined') {
          return acc.sub(safeParseUnits(balanceItem.fiatBalance, 18) || 0)
        }
        return acc
      }, BigNumber.from(!balances || balances.fiatTotal === '' ? 0 : safeParseUnits(balances.fiatTotal, 18)))
      .toString(),
    18,
  )

  const balanceItemsVisible = balances.items.filter(
    (balanceItem) => hiddenAssets?.[balanceItem.tokenInfo.address] === undefined,
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
  const hiddenAssets = useHiddenAssets()
  const { data, error, loading } = state

  return useMemo(
    () => ({
      balances: includeHidden ? data : removeHiddenBalances(data, hiddenAssets || {}),
      error,
      loading,
    }),
    [includeHidden, data, hiddenAssets, error, loading],
  )
}

export default useBalances
