import { useEffect } from 'react'

import { safeMsgSubscribe, SafeMsgEvent } from '@/services/safe-messages/safeMsgEvents'
import { useAppDispatch } from '@/store'
import { clearPendingSafeMessage, setPendingSafeMessage } from '@/store/pendingSafeMessagesSlice'

const pendingStatuses: Record<SafeMsgEvent, boolean> = {
  [SafeMsgEvent.PROPOSE]: true,
  [SafeMsgEvent.PROPOSE_FAILED]: false,
  [SafeMsgEvent.CONFIRM_PROPOSE]: true,
  [SafeMsgEvent.CONFIRM_PROPOSE_FAILED]: false,
  [SafeMsgEvent.UPDATED]: false,
  [SafeMsgEvent.SIGNATURE_PREPARED]: false,
}

const entries = Object.entries(pendingStatuses) as [keyof typeof pendingStatuses, boolean][]

const useSafeMessagePendingStatuses = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsubFns = entries.map(([event, isPending]) =>
      safeMsgSubscribe(event, ({ messageHash }) => {
        if (!isPending) {
          dispatch(clearPendingSafeMessage(messageHash))
          return
        }

        dispatch(setPendingSafeMessage(messageHash))
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [dispatch])
}

export default useSafeMessagePendingStatuses
