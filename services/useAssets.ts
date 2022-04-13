import { getBalances, SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useCallback, useEffect } from 'react'
import { useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import { GATEWAY_URL } from 'config/constants'
import useAsync from './useAsync'
import { Errors, logError } from './exceptions/CodedException'

const loadBalances = (chainId: string, address: string) => {
  return getBalances(GATEWAY_URL, chainId, address)
}

const useAssets = (): { balances?: SafeBalanceResponse; error?: Error; loading: boolean } => {
  const safeInfo = useAppSelector(selectSafeInfo)

  const loadAssets = useCallback(() => {
    if (!safeInfo.address.value) {
      return Promise.resolve(undefined)
    }
    return loadBalances(safeInfo.chainId, safeInfo.address.value)
  }, [safeInfo])

  const [data, error, loading] = useAsync<SafeBalanceResponse | undefined>(loadAssets)

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
