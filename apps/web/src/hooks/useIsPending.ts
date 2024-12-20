import { useAppSelector } from '@/store'
import { selectPendingTxs } from '@/store/pendingTxsSlice'

const useIsPending = (txId: string): boolean => {
  const pendingTxs = useAppSelector(selectPendingTxs)
  return !!pendingTxs[txId]
}

export default useIsPending
