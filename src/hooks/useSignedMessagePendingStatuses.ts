import { useEffect } from 'react'

import { signedMessageSubscribe, SignedMessageEvent } from '@/services/signed-messages/signedMessageEvents'
import { useAppDispatch } from '@/store'
import { clearPendingSignedMessage, setPendingSignedMessage } from '@/store/pendingSignedMessagesSlice'

const pendingStatuses: Record<SignedMessageEvent, boolean> = {
  [SignedMessageEvent.PROPOSE]: true,
  [SignedMessageEvent.PROPOSE_FAILED]: false,
  [SignedMessageEvent.CONFIRM_PROPOSE]: true,
  [SignedMessageEvent.CONFIRM_PROPOSE_FAILED]: false,
  [SignedMessageEvent.UPDATED]: false,
  [SignedMessageEvent.SIGNATURE_PREPARED]: false,
}

const useSignedMessagePendingStatuses = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const entries = Object.entries(pendingStatuses) as [keyof typeof pendingStatuses, boolean][]

    const unsubFns = entries.map(([event, isPending]) =>
      signedMessageSubscribe(event, ({ messageHash }) => {
        if (!isPending) {
          dispatch(clearPendingSignedMessage(messageHash))
          return
        }

        dispatch(setPendingSignedMessage(messageHash))
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  })
}

export default useSignedMessagePendingStatuses
