import { useEffect } from 'react'

import { MsgEvent, msgSubscribe } from '@/services/msg/msgEvents'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { formatError } from '@/utils/formatters'

const MsgNotifications: Partial<Record<MsgEvent, string>> = {
  [MsgEvent.PROPOSE]: 'You successfully signed the message.',
  [MsgEvent.PROPOSE_FAILED]: 'Signing the message failed. Please try again.',
  [MsgEvent.CONFIRM_PROPOSE]: 'You successfully confirmed the message.',
  [MsgEvent.CONFIRM_PROPOSE_FAILED]: 'Confirming the message failed. Please try again.',
  [MsgEvent.SIGNATURE_PREPARED]: 'The message was successfully confirmed.',
}

const useMsgNotifications = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const entries = Object.entries(MsgNotifications) as [keyof typeof MsgNotifications, string][]

    const unsubFns = entries.map(([event, baseMessage]) =>
      msgSubscribe(event, (detail) => {
        const isError = 'error' in detail
        const isSuccess = event === MsgEvent.PROPOSE || event === MsgEvent.SIGNATURE_PREPARED
        const message = isError ? `${baseMessage}${formatError(detail.error)}` : baseMessage

        const groupKey = 'messageHash' in detail ? detail.messageHash : ''

        dispatch(
          showNotification({
            message,
            detailedMessage: isError ? detail.error.message : undefined,
            groupKey,
            variant: isError ? 'error' : isSuccess ? 'success' : 'info',
          }),
        )
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [dispatch])
}

export default useMsgNotifications
