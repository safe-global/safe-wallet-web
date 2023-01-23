import { useEffect } from 'react'
import { getBalances, type SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import useAsync, { type AsyncResult } from '../useAsync'
import { Errors, logError } from '@/services/exceptions'
import { selectCurrency, selectSettings } from '@/store/settingsSlice'
import { selectSafeInfo } from '@/store/safeInfoSlice'

const isDefaultTokenList = (setting: 'ALL' | 'DEFAULT' | undefined) => !setting || setting === 'DEFAULT'

export const useLoadBalances = (): AsyncResult<SafeBalanceResponse> => {
  // use the selector directly because useSafeInfo is memoized
  const { data: safe } = useAppSelector(selectSafeInfo)
  const currency = useAppSelector(selectCurrency)
  const settings = useAppSelector(selectSettings)

  // Re-fetch assets when the entire SafeInfo updates
  const [data, error, loading] = useAsync<SafeBalanceResponse | undefined>(
    async () => {
      if (!safe) return
      return getBalances(safe.chainId, safe.address.value, currency, {
        trusted: isDefaultTokenList(settings.tokenList),
      })
    },
    [safe, currency, settings.tokenList], // Reload either when the Safe is updated, the currency changes or a different token list gets selected
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
