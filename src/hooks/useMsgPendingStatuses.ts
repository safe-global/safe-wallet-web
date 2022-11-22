import { useEffect } from 'react'

import { msgSubscribe, MsgEvent } from '@/services/msg/msgEvents'
import { useAppDispatch } from '@/store'
import { clearPendingMsg, setPendingMsg } from '@/store/pendingMsgsSlice'

const pendingStatuses: Record<MsgEvent, boolean> = {
  [MsgEvent.PROPOSE]: true,
  [MsgEvent.PROPOSE_FAILED]: false,
  [MsgEvent.CONFIRM_PROPOSE]: true,
  [MsgEvent.CONFIRM_PROPOSE_FAILED]: false,
  [MsgEvent.UPDATED]: false,
  [MsgEvent.SIGNATURE_PREPARED]: false,
}

const useMsgPendingStatuses = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const entries = Object.entries(pendingStatuses) as [keyof typeof pendingStatuses, boolean][]

    const unsubFns = entries.map(([event, isPending]) =>
      msgSubscribe(event, ({ messageHash }) => {
        if (!isPending) {
          dispatch(clearPendingMsg(messageHash))
          return
        }

        dispatch(setPendingMsg(messageHash))
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  })
}

export default useMsgPendingStatuses
