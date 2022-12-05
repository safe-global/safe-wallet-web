import { proposeSafeMessage, confirmSafeMessage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeInfo, SafeMessage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { RequestId } from '@gnosis.pm/safe-apps-sdk'

import { safeMsgDispatch, SafeMsgEvent } from './safeMsgEvents'
import { generateSafeMessageHash, generateSafeMessageTypes } from '@/utils/safe-messages'
import { signTypedData } from '@/utils/web3'

export const dispatchSafeMsgProposal = async (
  safe: SafeInfo,
  message: SafeMessage['message'],
  requestId: RequestId,
  safeAppId?: number,
): Promise<void> => {
  const messageHash = generateSafeMessageHash(safe, message)

  try {
    const typedData = generateSafeMessageTypes(safe, message)
    const signature = await signTypedData(typedData)

    await proposeSafeMessage(safe.chainId, safe.address.value, {
      message,
      signature,
      safeAppId,
    })
  } catch (error) {
    safeMsgDispatch(SafeMsgEvent.PROPOSE_FAILED, {
      messageHash,
      error: error as Error,
    })

    throw error
  }

  safeMsgDispatch(SafeMsgEvent.PROPOSE, {
    messageHash,
    requestId,
  })
}

// TODO: Refactor with above
export const dispatchSafeMsgConfirmation = async (
  safe: SafeInfo,
  message: SafeMessage['message'],
  requestId?: RequestId,
): Promise<void> => {
  const messageHash = generateSafeMessageHash(safe, message)

  try {
    const typedData = generateSafeMessageTypes(safe, message)
    const signature = await signTypedData(typedData)

    await confirmSafeMessage(safe.chainId, messageHash, {
      signature,
    })
  } catch (error) {
    safeMsgDispatch(SafeMsgEvent.CONFIRM_PROPOSE_FAILED, {
      messageHash,
      error: error as Error,
    })

    throw error
  }

  safeMsgDispatch(SafeMsgEvent.CONFIRM_PROPOSE, {
    messageHash,
    requestId,
  })
}
