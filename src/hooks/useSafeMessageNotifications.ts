import { useEffect } from 'react'

import { SafeMsgEvent, safeMsgSubscribe } from '@/services/safe-messages/safeMsgEvents'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { formatError } from '@/utils/formatters'

const SafeMessageNotifications: Partial<Record<SafeMsgEvent, string>> = {
  [SafeMsgEvent.PROPOSE]: 'You successfully signed the message.',
  [SafeMsgEvent.PROPOSE_FAILED]: 'Signing the message failed. Please try again.',
  [SafeMsgEvent.CONFIRM_PROPOSE]: 'You successfully confirmed the message.',
  [SafeMsgEvent.CONFIRM_PROPOSE_FAILED]: 'Confirming the message failed. Please try again.',
  [SafeMsgEvent.SIGNATURE_PREPARED]: 'The message was successfully confirmed.',
}

const useSafeMessageNotifications = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const entries = Object.entries(SafeMessageNotifications) as [keyof typeof SafeMessageNotifications, string][]

    const unsubFns = entries.map(([event, baseMessage]) =>
      safeMsgSubscribe(event, (detail) => {
        const isError = 'error' in detail
        const isSuccess = event === SafeMsgEvent.PROPOSE || event === SafeMsgEvent.SIGNATURE_PREPARED
        const message = isError ? `${baseMessage}${formatError(detail.error)}` : baseMessage

        dispatch(
          showNotification({
            message,
            detailedMessage: isError ? detail.error.message : undefined,
            groupKey: detail.messageHash,
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

export default useSafeMessageNotifications
