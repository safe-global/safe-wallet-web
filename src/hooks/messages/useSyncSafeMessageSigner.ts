import { dispatchPreparedSignature } from '@/services/safe-messages/safeMsgNotifications'
import { dispatchSafeMsgProposal, dispatchSafeMsgConfirmation } from '@/services/safe-messages/safeMsgSender'
import { type EIP712TypedData, type SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import { useEffect, useCallback, useState } from 'react'
import useSafeInfo from '../useSafeInfo'
import useOnboard from '../wallets/useOnboard'

const useSyncSafeMessageSigner = (
  message: SafeMessage | undefined,
  decodedMessage: string | EIP712TypedData,
  safeMessageHash: string,
  requestId: string | undefined,
  safeAppId: number | undefined,
  onClose: () => void,
) => {
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const onboard = useOnboard()
  const { safe } = useSafeInfo()

  // If the message gets updated in the messageSlice we dispatch it if the signature is complete
  useEffect(() => {
    if (message?.preparedSignature) {
      dispatchPreparedSignature(safe.chainId, safeMessageHash, onClose, requestId)
    }
  }, [message, safe.chainId, safeMessageHash, onClose, requestId])

  const onSign = useCallback(async () => {
    // Error is shown when no wallet is connected, this appeases TypeScript
    if (!onboard) {
      return
    }

    setSubmitError(undefined)

    try {
      // When collecting the first signature
      if (!message) {
        await dispatchSafeMsgProposal({ onboard, safe, message: decodedMessage, safeAppId })

        // If threshold 1, we do not want to wait for polling
        if (safe.threshold === 1) {
          await dispatchPreparedSignature(safe.chainId, safeMessageHash, onClose, requestId)
        }
      } else {
        await dispatchSafeMsgConfirmation({ onboard, safe, message: decodedMessage })

        // No requestID => we are in the confirm message dialog and do not need to leave the window open
        if (!requestId) {
          onClose()
          return
        }

        // If the last signature was added to the message, we can immediately dispatch the signature
        if (message.confirmationsRequired <= message.confirmationsSubmitted + 1) {
          dispatchPreparedSignature(safe.chainId, safeMessageHash, onClose, requestId)
        }
      }
    } catch (e) {
      setSubmitError(e as Error)
    }
  }, [onboard, requestId, message, safe, decodedMessage, safeAppId, safeMessageHash, onClose])

  return { submitError, onSign }
}

export default useSyncSafeMessageSigner
