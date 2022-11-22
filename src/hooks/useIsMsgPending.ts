import { useAppSelector } from '@/store'
import { selectPendingMsgByHash } from '@/store/pendingMsgsSlice'

const useIsMsgPending = (messageHash: string): boolean => {
  return useAppSelector((state) => selectPendingMsgByHash(state, messageHash))
}

export default useIsMsgPending
