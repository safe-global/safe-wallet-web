import { getBalances, SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'
import { Errors, logError } from './exceptions'
import { selectBalances, setBalances } from '@/store/balancesSlice'

export const useInitBalances = (): void => {
  const { safe } = useSafeInfo()
  const dispatch = useAppDispatch()

  // Re-fetch assets when the entire SafeInfo updates
  const [data, error] = useAsync<SafeBalanceResponse | undefined>(async () => {
    if (!safe.address.value) return
    return getBalances(safe.chainId, safe.address.value)
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

const useBalances = () => {
  const balances = useAppSelector(selectBalances)
  return balances
}

export default useBalances
