import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import { safeMsgDispatch, SafeMsgEvent } from './safeMsgEvents'

const isMessageFullySigned = (message: SafeMessage): message is SafeMessage & { preparedSignature: string } => {
  return message.confirmationsSubmitted >= message.confirmationsRequired && !!message.preparedSignature
}

/**
 * Dispatches a notification including the `preparedSignature` of the message if it is fully signed.
 *
 * @param chainId
 * @param safeMessageHash
 * @param onClose
 * @param requestId
 */
export const dispatchPreparedSignature = async (
  message: SafeMessage,
  safeMessageHash: string,
  onClose: () => void,
  requestId?: string,
) => {
  if (isMessageFullySigned(message)) {
    safeMsgDispatch(SafeMsgEvent.SIGNATURE_PREPARED, {
      messageHash: safeMessageHash,
      requestId,
      signature: message.preparedSignature,
    })
    onClose()
  }
}
