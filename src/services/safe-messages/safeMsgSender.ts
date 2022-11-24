import { proposeSafeMessage, confirmSafeMessage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeInfo, SafeMessage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { TypedDataDomain } from 'ethers'

import { safeMsgDispatch, SafeMsgEvent } from './safeMsgEvents'
import { getWeb3 } from '@/hooks/wallets/web3'
import { generateSafeMessageTypes, getSafeMessageHash } from '@/utils/safe-messages'

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

export const dispatchSafeMsgProposal = async (
  safe: SafeInfo,
  message: SafeMessage['message'],
  safeAppId: number,
): Promise<void> => {
  const messageHash = getSafeMessageHash(message)

  try {
    const signature = await signMessageHash(safe, messageHash)

    proposeSafeMessage(safe.chainId, safe.address.value, {
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
  })
}

export const dispatchSafeMsgConfirmation = async (
  safe: SafeInfo,
  messageHash: SafeMessage['messageHash'],
): Promise<void> => {
  try {
    const signature = await signMessageHash(safe, messageHash)

    confirmSafeMessage(safe.chainId, messageHash, {
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
