import { getBalances, SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'
import { Errors, logError } from './exceptions'
import { selectBalances, setBalances, initialState } from '@/store/balancesSlice'
import { updateAddedSafeBalance } from '@/store/addedSafesSlice'

export const useInitBalances = (): void => {
  const { safe } = useSafeInfo()
  const dispatch = useAppDispatch()

  // Re-fetch assets when the entire SafeInfo updates
  const [data, error] = useAsync<SafeBalanceResponse | undefined>(async () => {
    if (!safe) return
    return getBalances(safe.chainId, safe.address.value)
  }, [safe])

  // Clear the old Balances when Safe address is changed
  useEffect(() => {
    if (!safe) {
      dispatch(setBalances({ balances: initialState.balances, loading: true }))
    }
  }, [dispatch, safe])

  // Set new balances
  useEffect(() => {
    if (data || error) {
      dispatch(setBalances({ balances: data || initialState.balances, error, loading: false }))
    }
  }, [dispatch, data, error])

  // Update the added safes with the new balances
  useEffect(() => {
    if (data && safe) {
      dispatch(updateAddedSafeBalance({ chainId: safe.chainId, address: safe.address.value, balances: data }))
    }
  }, [dispatch, data, safe])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._601, error.message)
    }
  }, [error])
}

const useBalances = () => {
  const balances = useAppSelector(selectBalances)
  return balances
}

export default useBalances
