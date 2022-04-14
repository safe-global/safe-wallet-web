import { useEffect } from 'react'
import { getFiatCurrencies, FiatCurrencies } from '@gnosis.pm/safe-react-gateway-sdk'
import { GATEWAY_URL } from 'config/constants'
import useAsync from 'services/useAsync'
import { Errors, logError } from 'services/exceptions/CodedException'

const useCurriencies = (): FiatCurrencies | undefined => {
  // Re-fetch assets when the entire SafeInfo updates
  const [data, error] = useAsync<FiatCurrencies>(async () => {
    return getFiatCurrencies(GATEWAY_URL)
  }, [])

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._607, error.message)
  }, [error])

  return data
}

export default useCurriencies
