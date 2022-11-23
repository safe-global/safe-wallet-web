import { useAppSelector } from '@/store'
import { selectPendingSignedMessageByHash } from '@/store/pendingSignedMessagesSlice'

const useIsSignedMessagePending = (messageHash: string): boolean => {
  return useAppSelector((state) => selectPendingSignedMessageByHash(state, messageHash))
}

export default useIsSignedMessagePending
