import { isSafeMessageListItem } from '@/utils/safe-message-guards'
import { type SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import { useState, useEffect } from 'react'
import useSafeMessages from './useSafeMessages'
import useAsync from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { fetchSafeMessage } from './useSyncSafeMessageSigner'

const useSafeMessage = (safeMessageHash: string) => {
  const [safeMessage, setSafeMessage] = useState<SafeMessage | undefined>()

  const { safe } = useSafeInfo()

  const messages = useSafeMessages()

  const ongoingMessage = messages.page?.results
    ?.filter(isSafeMessageListItem)
    .find((msg) => msg.messageHash === safeMessageHash)

  const [updatedMessage] = useAsync(async () => {
    return fetchSafeMessage(safeMessageHash, safe.chainId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeMessageHash, safe.chainId, safe.messagesTag])

  useEffect(() => {
    setSafeMessage(updatedMessage ?? ongoingMessage)
  }, [ongoingMessage, updatedMessage])

  return [safeMessage, setSafeMessage] as const
}

export default useSafeMessage
