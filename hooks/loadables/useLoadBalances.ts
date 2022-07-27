import { useEffect } from 'react'
import { getBalances, type SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import { selectCurrency } from '@/store/settingsSlice'

export const useLoadBalances = (): AsyncResult<SafeBalanceResponse> => {
  const { safe, safeLoaded } = useSafeInfo()
  const currency = useAppSelector(selectCurrency)

  // Re-fetch assets when the entire SafeInfo updates
  const [data, error, loading] = useAsync<SafeBalanceResponse | undefined>(
    async () => {
      // SafeInfo becomes undefined when the safe address in the URL changes
      // At this point Balances should also become undefined
      if (!safeLoaded) return
      return getBalances(safe.chainId, safe.address.value, currency)
    },
    [safe, safeLoaded, currency], // Reload either when the Safe is updated or the currency changes
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
