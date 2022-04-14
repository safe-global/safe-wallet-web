import { getBalances, SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import { GATEWAY_URL } from 'config/constants'
import useAsync from './useAsync'
import { Errors, logError } from './exceptions/CodedException'
import { setBalances } from 'store/balancesSlice'

const loadBalances = (chainId: string, address: string) => {
  return getBalances(GATEWAY_URL, chainId, address)
}

const useBalances = (): void => {
  const { safe } = useAppSelector(selectSafeInfo)
  const dispatch = useAppDispatch()

  // Re-fetch assets when SafeInfo changes
  const [data, error] = useAsync<SafeBalanceResponse | undefined>(async () => {
    const safeAddress = safe.address.value
    return safeAddress ? loadBalances(safe.chainId, safeAddress) : undefined
  }, [safe])

  useEffect(() => {
    dispatch(setBalances(data))
  }, [data, dispatch])

  useEffect(() => {
    if (!error) return
    logError(Errors._601, error.message)
  }, [error])
}

export default useBalances
