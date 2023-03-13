import { useEffect, useMemo } from 'react'
import { getBalances, type SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import useAsync, { type AsyncResult } from '../useAsync'
import { Errors, logError } from '@/services/exceptions'
import { selectCurrency, selectSettings, TOKEN_LISTS } from '@/store/settingsSlice'
import { selectSafeInfo } from '@/store/safeInfoSlice'
import { useCurrentChain } from '../useChains'
import { FEATURES, hasFeature } from '@/utils/chains'

export const useLoadBalances = (): AsyncResult<SafeBalanceResponse> => {
  // use the selector directly because useSafeInfo is memoized
  const { data: safe } = useAppSelector(selectSafeInfo)
  const currency = useAppSelector(selectCurrency)
  const settings = useAppSelector(selectSettings)
  const chain = useCurrentChain()
  const isTrustedTokenList = useMemo(() => {
    const hasTrustedList = chain !== undefined && hasFeature(chain, FEATURES.DEFAULT_TOKENLIST)
    return hasTrustedList && (!settings.tokenList || settings.tokenList === TOKEN_LISTS.TRUSTED)
  }, [chain, settings.tokenList])

  // Re-fetch assets when the entire SafeInfo updates
  const [data, error, loading] = useAsync<SafeBalanceResponse | undefined>(
    async () => {
      if (!safe) return
      return getBalances(safe.chainId, safe.address.value, currency, {
        trusted: isTrustedTokenList,
      })
    },
    [safe, currency, isTrustedTokenList], // Reload either when the Safe is updated, the currency changes or a different token list gets selected
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
