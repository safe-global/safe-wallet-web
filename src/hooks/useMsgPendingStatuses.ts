import { useEffect } from 'react'

import { msgSubscribe, MsgEvent } from '@/services/msg/msgEvents'
import { useAppDispatch } from '@/store'
import { clearPendingMsg, setPendingMsg } from '@/store/pendingMsgsSlice'

const pendingStatuses: Record<MsgEvent, boolean> = {
  [MsgEvent.CREATE]: true,
  [MsgEvent.CREATE_FAILED]: false,
  [MsgEvent.CONFIRM]: true,
  [MsgEvent.CONFIRM_FAILED]: false,
  [MsgEvent.CONFIRMATION_SAVED]: false,
  [MsgEvent.FULLY_CONFIRMED]: false,
}

const useMsgPendingStatuses = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const entries = Object.entries(pendingStatuses) as [keyof typeof pendingStatuses, boolean][]

    const unsubFns = entries.map(([event, isPending]) =>
      msgSubscribe(event, (detail) => {
        const messageHash = 'messageHash' in detail && detail.messageHash

        if (!messageHash) {
          return
        }

        if (!isPending) {
          dispatch(clearPendingMsg(messageHash))
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
