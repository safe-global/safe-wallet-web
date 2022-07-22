import { useMemo } from 'react'
import { type SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import { selectBalances } from '@/store/balancesSlice'

const useBalances = (): {
  balances: SafeBalanceResponse
  loading: boolean
  error?: string
} => {
  const state = useAppSelector(selectBalances)
  const { data, error, loading } = state

  return useMemo(
    () => ({
      balances: data,
      error,
      loading,
    }),
    [data, error, loading],
  )
}

export default useBalances
