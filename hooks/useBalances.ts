import { useAppSelector } from '@/store'
import { selectBalances } from '@/store/balancesSlice'

const useBalances = () => {
  const state = useAppSelector(selectBalances)
  return {
    balances: state.data,
    loading: state.loading,
    error: state.error,
  }
}

export default useBalances
