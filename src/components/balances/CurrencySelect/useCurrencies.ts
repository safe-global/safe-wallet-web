import { useEffect } from 'react'
import type { FiatCurrencies } from '@safe-global/safe-gateway-typescript-sdk'
import { getFiatCurrencies } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync from '@/hooks/useAsync'
import { Errors, logError } from '@/services/exceptions'

const useCurrencies = (): FiatCurrencies | undefined => {
  // Re-fetch assets when the entire SafeInfo updates
  const [data, error] = useAsync<FiatCurrencies>(getFiatCurrencies, [])

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._607, error.message)
  }, [error])

  return data
}

export default useCurrencies
