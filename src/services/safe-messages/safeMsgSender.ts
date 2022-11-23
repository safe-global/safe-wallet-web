import { safeMsgDispatch, SafeMsgEvent } from './safeMsgEvents'
import { keccak256, _TypedDataEncoder } from 'ethers/lib/utils'
import type { SafeMessage } from '@/store/safeMessagesSlice'

const getMessageHash = (message: string | Record<string, any>): string => {
  if (typeof message === 'string') {
    return keccak256(message)
  }

  return _TypedDataEncoder.encode(message.domain, message.types, message.message)
}

export const dispatchSafeMsgProposal = (message: string | Record<string, any>, _safeAppId: number) => {
  let proposedSignedMsg: SafeMessage | undefined

  const messageHash = getMessageHash(message)

  try {
    // TODO: Propose and save response
    proposedSignedMsg = { messageHash: '' } as SafeMessage
  } catch (error) {
    safeMsgDispatch(SafeMsgEvent.PROPOSE_FAILED, {
      messageHash,
      error: error as Error,
    })

    throw error
  }

  // TODO: Check that the generated messageHash matches that of the backend and otherwise throw

  safeMsgDispatch(SafeMsgEvent.PROPOSE, {
    messageHash: proposedSignedMsg.messageHash,
  })
}

export const dispatchSafeMsgConfirmation = (messageHash: SafeMessage['messageHash']) => {
  try {
    // TODO: Confirm and save response
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
