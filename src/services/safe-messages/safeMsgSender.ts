import { proposeSafeMessage, confirmSafeMessage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeInfo, SafeMessage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { TypedDataDomain } from 'ethers'

import { safeMsgDispatch, SafeMsgEvent } from './safeMsgEvents'
import { getWeb3 } from '@/hooks/wallets/web3'
import { generateSafeMessageTypes } from '@/utils/safe-messages'
import type { RequestId } from '@gnosis.pm/safe-apps-sdk'

/**
 * Sign a message hash as a `SafeMessage` `message`
 * @param safe Safe which will sign the message
 * @param messageHash Message hash to sign
 * @returns Signature of the `SafeMessage`
 */
const signMessageHash = async (safe: SafeInfo, messageHash: SafeMessage['messageHash']): Promise<string> => {
  const web3 = getWeb3()

  if (!web3) {
    throw new Error('No wallet is connected.')
  }

  const { domain, types, message } = generateSafeMessageTypes(safe, messageHash)

  return web3.getSigner()._signTypedData(domain as TypedDataDomain, types, message)
}

// TODO: Modify pending/notifications for immediately returned signatures, e.g. 1/n threshold
export const dispatchSafeMsgProposal = async (
  safe: SafeInfo,
  message: SafeMessage['message'],
  messageHash: string,
  requestId: RequestId,
  safeAppId?: number,
): Promise<void | string> => {
  let signature: string

  try {
    signature = await signMessageHash(safe, messageHash)
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
    signature,
    requestId,
  })

  return safe.threshold === 1 ? signature : undefined
}

// TODO: Handle immediately returned strings
export const dispatchSafeMsgConfirmation = async (
  safe: SafeInfo,
  messageHash: SafeMessage['messageHash'],
): Promise<void> => {
  try {
    const signature = await signMessageHash(safe, messageHash)

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
