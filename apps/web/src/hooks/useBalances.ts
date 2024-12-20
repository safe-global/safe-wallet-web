import { useMemo } from 'react'
import isEqual from 'lodash/isEqual'
import { type SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import { initialBalancesState, selectBalances } from '@/store/balancesSlice'

const useBalances = (): {
  balances: SafeBalanceResponse
  loading: boolean
  error?: string
} => {
  const state = useAppSelector(selectBalances, isEqual)
  const { data, error, loading } = state

  return useMemo(
    () => ({
      balances: data,
      error,
      loading: loading || initialBalancesState === data,
    }),
    [data, error, loading],
  )
}

export default useBalances
