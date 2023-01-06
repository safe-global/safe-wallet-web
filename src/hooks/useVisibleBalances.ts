import { safeFormatUnits, safeParseUnits } from '@/utils/formatters'
import type { SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import useBalances from './useBalances'
import useHiddenTokens from './useHiddenTokens'

const PRECISION = 18

/**
 * We have to avoid underflows for too high precisions.
 * We only display very few floating points anyway so a precision of 18 should be more than enough.
 */
const truncateNumber = (balance: string): string => {
  const floatingPointPosition = balance.indexOf('.')
  if (floatingPointPosition < 0) {
    return balance
  }

  const currentPrecision = balance.length - floatingPointPosition - 1
  return currentPrecision < PRECISION ? balance : balance.slice(0, floatingPointPosition + PRECISION + 1)
}

const filterHiddenBalances = (balances: SafeBalanceResponse, hiddenAssets: string[]): SafeBalanceResponse => {
  const fiatTotalVisible = safeFormatUnits(
    balances.items
      .reduce((acc, balanceItem) => {
        if (hiddenAssets.includes(balanceItem.tokenInfo.address)) {
          return acc.sub(safeParseUnits(truncateNumber(balanceItem.fiatBalance), PRECISION) || 0)
        }
        return acc
      }, BigNumber.from(balances.fiatTotal === '' ? 0 : safeParseUnits(truncateNumber(balances.fiatTotal), PRECISION)))
      .toString(),
    PRECISION,
  )

  const balanceItemsVisible = balances.items.filter(
    (balanceItem) => !hiddenAssets.includes(balanceItem.tokenInfo.address),
  )

  return { fiatTotal: fiatTotalVisible, items: balanceItemsVisible }
}

export const useVisibleBalances = (): {
  balances: SafeBalanceResponse
  loading: boolean
  error?: string
} => {
  const balances = useBalances()
  const hiddenTokens = useHiddenTokens()

  return useMemo(
    () => ({
      ...balances,
      balances: filterHiddenBalances(balances.balances, hiddenTokens),
    }),
    [balances, hiddenTokens],
  )
}
