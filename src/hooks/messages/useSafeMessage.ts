import { isSafeMessageListItem } from '@/utils/safe-message-guards'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import { useState, useEffect } from 'react'
import useSafeMessages from './useSafeMessages'

const useSafeMessage = (safeMessageHash: string) => {
  const [safeMessage, setSafeMessage] = useState<SafeMessage | undefined>()

  const messages = useSafeMessages()

  const ongoingMessage = messages.page?.results
    ?.filter(isSafeMessageListItem)
    .find((msg) => msg.messageHash === safeMessageHash)

  useEffect(() => {
    setSafeMessage(ongoingMessage)
  }, [ongoingMessage])

  return [safeMessage, setSafeMessage] as const
}

export default useSafeMessage
