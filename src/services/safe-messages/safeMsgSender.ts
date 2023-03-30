import { proposeSafeMessage, confirmSafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeInfo, SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import type { RequestId } from '@safe-global/safe-apps-sdk'
import { isObjectEIP712TypedData } from '@safe-global/safe-apps-sdk'
import type { TypedDataDomain } from 'ethers'
import type { OnboardAPI } from '@web3-onboard/core'

import { safeMsgDispatch, SafeMsgEvent } from './safeMsgEvents'
import { generateSafeMessageHash, generateSafeMessageTypedData } from '@/utils/safe-messages'
import { normalizeTypedData } from '@/utils/web3'
import { getAssertedChainSigner } from '@/services/tx/tx-sender/sdk'

export const dispatchSafeMsgProposal = async ({
  onboard,
  safe,
  message,
  requestId,
  safeAppId,
}: {
  onboard: OnboardAPI
  safe: SafeInfo
  message: SafeMessage['message']
  requestId: RequestId
  safeAppId?: number
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
    requestId,
  })
}

export const dispatchSafeMsgConfirmation = async ({
  onboard,
  safe,
  message,
  requestId,
}: {
  onboard: OnboardAPI
  safe: SafeInfo
  message: SafeMessage['message']
  requestId?: RequestId
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
    requestId,
  })
}
