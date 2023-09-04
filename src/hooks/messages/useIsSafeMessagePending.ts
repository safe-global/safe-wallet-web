import { useAppSelector } from '@/store'
import { selectPendingSafeMessageByHash } from '@/store/pendingSafeMessagesSlice'

const useIsSafeMessagePending = (messageHash: string): boolean => {
  return useAppSelector((state) => selectPendingSafeMessageByHash(state, messageHash))
}

export default useIsSafeMessagePending
