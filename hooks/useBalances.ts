import { useAppSelector } from '@/store'
import { selectBalances } from '@/store/balancesSlice'

const useBalances = () => {
  const state = useAppSelector(selectBalances)
  return {
    balances: state.data,
    loading: state.loading && !state.data,
    error: state.data ? undefined : state.error,
  }
}

export default useBalances
