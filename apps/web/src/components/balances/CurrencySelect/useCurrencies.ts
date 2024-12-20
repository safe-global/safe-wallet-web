import { useEffect } from 'react'
import type { FiatCurrencies } from '@safe-global/safe-gateway-typescript-sdk'
import { getFiatCurrencies } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync from '@/hooks/useAsync'
import { Errors, logError } from '@/services/exceptions'

// The SDK returns a list of currencies, including crypto
// some of the crypto currencies have a length of 4 characters
// we filter them out because the frontend only supports ISO 4217 currencies
// and they have to be exactly 3 characters long
// if that is not the case Intl.NumberFormat will throw an error and crash the app
const getISO4217Currencies = async (): Promise<FiatCurrencies> => {
  const currencies = await getFiatCurrencies()

  return currencies.filter((currency) => currency.length === 3)
}

const useCurrencies = (): FiatCurrencies | undefined => {
  // Re-fetch assets when the entire SafeInfo updates
  const [data, error] = useAsync<FiatCurrencies>(getISO4217Currencies, [])

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._607, error.message)
  }, [error])

  return data
}

export default useCurrencies
