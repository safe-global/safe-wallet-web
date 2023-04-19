import { useEffect, useState } from 'react'
import { safeMsgDispatch, SafeMsgEvent } from '@/services/safe-messages/safeMsgEvents'
import { getSafeMessage, type SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import { Errors, logError } from '@/services/exceptions'

const isMessageFullySigned = (message: SafeMessage): message is SafeMessage & { preparedSignature: string } => {
  return message.confirmationsSubmitted >= message.confirmationsRequired && !!message.preparedSignature
}

const usePollOffchainMessage = (chainId: string, safeMessageHash: string, onClose: () => void, requestId?: string) => {
  const [ongoingMessage, setOngoingMessage] = useState<SafeMessage>()
  const [isPolling, setIsPolling] = useState(false)
  const CONFIRMATIONS_POLLING_INTERVAL = 3000

  useEffect(() => {
    const fetchSafeMessage = async () => {
      try {
        // the response has to be a SafeMessage as it is the only type with safeMessageHash
        const message = (await getSafeMessage(chainId, safeMessageHash)) as SafeMessage
        setOngoingMessage(message)
        setIsPolling(true)

        if (isMessageFullySigned(message)) {
          setIsPolling(false)
          clearInterval(intervalId)
          safeMsgDispatch(SafeMsgEvent.SIGNATURE_PREPARED, {
            messageHash: safeMessageHash,
            requestId,
            signature: message.preparedSignature,
          })
          onClose()
        }
      } catch (err) {
        logError(Errors._613, (err as Error).message)
      }
    }

    // Inititally load message
    if (!ongoingMessage) {
      fetchSafeMessage()
    }

    if (!isPolling) return

    // Start polling
    const intervalId = setInterval(() => {
      fetchSafeMessage()
    }, CONFIRMATIONS_POLLING_INTERVAL)

    return () => clearInterval(intervalId)
  }, [chainId, isPolling, onClose, ongoingMessage, requestId, safeMessageHash])

  return ongoingMessage
}

export default usePollOffchainMessage
