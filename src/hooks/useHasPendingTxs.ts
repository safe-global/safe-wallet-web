import { useAppSelector } from '@/store'
import { selectPendingTxs } from '@/store/pendingTxsSlice'

const useHasPendingTxs = () => {
  const pendingTxs = useAppSelector(selectPendingTxs)
  return Object.keys(pendingTxs).length > 0
}

export default useHasPendingTxs
