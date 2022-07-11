import { useAppSelector } from '@/store'
import { selectBalances } from '@/store/balancesSlice'

const useBalances = () => {
  const state = useAppSelector(selectBalances)
  const { data, error, loading } = state
  return {
    balances: data,
    error,
    loading,
  }
}

export default useBalances
