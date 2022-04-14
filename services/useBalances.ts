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

  // Re-fetch assets when the entire SafeInfo updates
  const [data, error] = useAsync<SafeBalanceResponse | undefined>(async () => {
    if (!safe.address.value) return
    return loadBalances(safe.chainId, safe.address.value)
  }, [safe])

  // Clear the old Balances when Safe address is changed
  useEffect(() => {
    dispatch(setBalances(undefined))
  }, [safe.address.value, safe.chainId])

  // Save the Balances in the store
  useEffect(() => {
    if (data) dispatch(setBalances(data))
  }, [data, dispatch])

  // Log errors
  useEffect(() => {
    if (!error) return
    logError(Errors._601, error.message)
  }, [error])
}

export default useBalances
