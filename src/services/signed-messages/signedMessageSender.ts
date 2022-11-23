import { signedMessageDispatch, SignedMessageEvent } from './signedMessageEvents'
import { keccak256, _TypedDataEncoder } from 'ethers/lib/utils'
import type { SignedMessage } from '@/store/signedMessagesSlice'

const getMessageHash = (message: string | Record<string, any>): string => {
  if (typeof message === 'string') {
    return keccak256(message)
  }

  return _TypedDataEncoder.encode(message.domain, message.types, message.message)
}

export const dispatchSignedMesssageProposal = (message: string | Record<string, any>, _safeAppId: number) => {
  let proposedSignedMsg: SignedMessage | undefined

  const messageHash = getMessageHash(message)

  try {
    // TODO: Propose and save response
    proposedSignedMsg = { messageHash: '' } as SignedMessage
  } catch (error) {
    signedMessageDispatch(SignedMessageEvent.PROPOSE_FAILED, {
      messageHash,
      error: error as Error,
    })

    throw error
  }

  // TODO: Check that the generated messageHash matches that of the backend and otherwise throw

  signedMessageDispatch(SignedMessageEvent.PROPOSE, {
    messageHash: proposedSignedMsg.messageHash,
  })
}

export const dispatchSignedMessageConfirmation = (messageHash: SignedMessage['messageHash']) => {
  try {
    // TODO: Confirm and save response
  } catch (error) {
    signedMessageDispatch(SignedMessageEvent.CONFIRM_PROPOSE_FAILED, {
      messageHash,
      error: error as Error,
    })

    throw error
  }

  signedMessageDispatch(SignedMessageEvent.CONFIRM_PROPOSE, {
    messageHash,
  })
}
