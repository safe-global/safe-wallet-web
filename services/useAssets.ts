import { getBalances, SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import { GATEWAY_URL } from 'config/constants'
import useAsync from './useAsync'
import { Errors, logError } from './exceptions/CodedException'

const loadBalances = (chainId: string, address: string) => {
  return getBalances(GATEWAY_URL, chainId, address)
}

const useAssets = (): { balances?: SafeBalanceResponse; error?: Error; loading: boolean } => {
  const { safe } = useAppSelector(selectSafeInfo)

  // Re-fetch assets when SafeInfo changes
  const [data, error, loading] = useAsync<SafeBalanceResponse | undefined>(() => {
    const safeAddress = safe.address.value

    if (!safeAddress) {
      return Promise.resolve(undefined)
    }
    return loadBalances(safe.chainId, safeAddress)
  }, [safe])

  useEffect(() => {
    if (!error) return
    logError(Errors._601, error.message)
  }, [error])

  return {
    balances: data,
    error,
    loading,
  }
}

export default useAssets
