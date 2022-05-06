import useSafeAddress from '@/services/useSafeAddress'
import { useAppSelector } from '@/store'
import { selectPendingTx } from '@/store/pendingTxsSlice'

const useIsPending = ({ txId }: { txId: string }): boolean => {
  const { chainId } = useSafeAddress()
  const pendingTx = useAppSelector((state) => selectPendingTx(state, { chainId, txId }))
  return !!pendingTx
}

export default useIsPending
