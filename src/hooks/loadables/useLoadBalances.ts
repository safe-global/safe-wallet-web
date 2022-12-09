import { useEffect } from 'react'
import { getBalances, type SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import useAsync, { type AsyncResult } from '../useAsync'
import { Errors, logError } from '@/services/exceptions'
import { selectCurrency } from '@/store/settingsSlice'
import { selectSafeInfo } from '@/store/safeInfoSlice'

export const useLoadBalances = (): AsyncResult<SafeBalanceResponse> => {
  // use the selector directly because useSafeInfo is memoized
  const { data: safe } = useAppSelector(selectSafeInfo)
  const currency = useAppSelector(selectCurrency)

  // Re-fetch assets when the entire SafeInfo updates
  const [data, error, loading] = useAsync<SafeBalanceResponse | undefined>(
    async () => {
      if (!safe) return
      return getBalances(safe.chainId, safe.address.value, currency)
    },
    [safe, currency], // Reload either when the Safe is updated or the currency changes
    false, // Don't clear data between SafeInfo polls
  )

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._601, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadBalances
