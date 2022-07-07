import { useEffect } from 'react'
import { getBalances, type SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import { selectCurrency } from '@/store/sessionSlice'

export const useLoadBalances = (): AsyncResult<SafeBalanceResponse> => {
  const { safe } = useSafeInfo()
  const currency = useAppSelector(selectCurrency)

  // Re-fetch assets when the entire SafeInfo updates
  const [data, error, loading] = useAsync<SafeBalanceResponse | undefined>(async () => {
    if (!safe) return
    return getBalances(safe.chainId, safe.address.value, currency)
  }, [safe, currency])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._601, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadBalances
