import { proposeSafeMessage, confirmSafeMessage, getSafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeInfo, SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import { isObjectEIP712TypedData } from '@safe-global/safe-apps-sdk'
import type { TypedDataDomain } from 'ethers'
import type { OnboardAPI } from '@web3-onboard/core'
import { Errors, logError } from '@/services/exceptions'

import { safeMsgDispatch, SafeMsgEvent } from './safeMsgEvents'
import { generateSafeMessageHash, generateSafeMessageTypedData } from '@/utils/safe-messages'
import { normalizeTypedData } from '@/utils/web3'
import { getAssertedChainSigner } from '@/services/tx/tx-sender/sdk'

export const dispatchSafeMsgProposal = async ({
  onboard,
  safe,
  message,
  safeAppId,
}: {
  onboard: OnboardAPI
  safe: SafeInfo
  message: SafeMessage['message']
  safeAppId?: number
}): Promise<void> => {
  const messageHash = generateSafeMessageHash(safe, message)
  let signature = undefined
  try {
    const typedData = generateSafeMessageTypedData(safe, message)

    const signer = await getAssertedChainSigner(onboard, safe.chainId)
    signature = await signer._signTypedData(typedData.domain as TypedDataDomain, typedData.types, typedData.message)

    let normalizedMessage = message
    if (isObjectEIP712TypedData(message)) {
      normalizedMessage = normalizeTypedData(message)
    }

    await proposeSafeMessage(safe.chainId, safe.address.value, {
      message: normalizedMessage,
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
  })
}

export const dispatchSafeMsgConfirmation = async ({
  onboard,
  safe,
  message,
}: {
  onboard: OnboardAPI
  safe: SafeInfo
  message: SafeMessage['message']
}): Promise<void> => {
  const messageHash = generateSafeMessageHash(safe, message)

  try {
    const typedData = generateSafeMessageTypedData(safe, message)

    const signer = await getAssertedChainSigner(onboard, safe.chainId)
    const signature = await signer._signTypedData(
      typedData.domain as TypedDataDomain,
      typedData.types,
      typedData.message,
    )

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
  })
}

const isMessageFullySigned = (message: SafeMessage): message is SafeMessage & { preparedSignature: string } => {
  return message.confirmationsSubmitted >= message.confirmationsRequired && !!message.preparedSignature
}

export const dispatchPreparedSignature = async (
  chainId: string,
  safeMessageHash: string,
  onClose: () => void,
  requestId?: string,
) => {
  let message
  try {
    // the response has to be a SafeMessage as it is the only type with safeMessageHash
    message = (await getSafeMessage(chainId, safeMessageHash)) as SafeMessage
  } catch (err) {
    logError(Errors._613, (err as Error).message)
  }

  if (message && isMessageFullySigned(message)) {
    safeMsgDispatch(SafeMsgEvent.SIGNATURE_PREPARED, {
      messageHash: safeMessageHash,
      requestId,
      signature: message.preparedSignature,
    })
    onClose()
  }
}
