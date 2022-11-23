import { useEffect } from 'react'

import { SignedMessageEvent, signedMessageSubscribe } from '@/services/signed-messages/signedMessageEvents'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { formatError } from '@/utils/formatters'

const SignedMessageNotifications: Partial<Record<SignedMessageEvent, string>> = {
  [SignedMessageEvent.PROPOSE]: 'You successfully signed the message.',
  [SignedMessageEvent.PROPOSE_FAILED]: 'Signing the message failed. Please try again.',
  [SignedMessageEvent.CONFIRM_PROPOSE]: 'You successfully confirmed the message.',
  [SignedMessageEvent.CONFIRM_PROPOSE_FAILED]: 'Confirming the message failed. Please try again.',
  [SignedMessageEvent.SIGNATURE_PREPARED]: 'The message was successfully confirmed.',
}

const useSignedMessageNotifications = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const entries = Object.entries(SignedMessageNotifications) as [keyof typeof SignedMessageNotifications, string][]

    const unsubFns = entries.map(([event, baseMessage]) =>
      signedMessageSubscribe(event, (detail) => {
        const isError = 'error' in detail
        const isSuccess = event === SignedMessageEvent.PROPOSE || event === SignedMessageEvent.SIGNATURE_PREPARED
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

export default useSignedMessageNotifications
