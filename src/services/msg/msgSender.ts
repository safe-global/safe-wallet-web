import { msgDispatch, MsgEvent } from './msgEvents'
import { keccak256, _TypedDataEncoder } from 'ethers/lib/utils'
import type { Message } from '@/store/msgsSlice'

const getMessageHash = (message: string | Record<string, any>): string => {
  if (typeof message === 'string') {
    return keccak256(message)
  }

  return _TypedDataEncoder.encode(message.domain, message.types, message.message)
}

export const dispatchMsgProposal = (message: string | Record<string, any>, _safeAppId: number) => {
  let proposedMsg: Message | undefined

  const messageHash = getMessageHash(message)

  try {
    // TODO: Propose and save response
    proposedMsg = { messageHash: '' } as Message
  } catch (error) {
    msgDispatch(MsgEvent.PROPOSE_FAILED, {
      messageHash,
      error: error as Error,
    })

    throw error
  }

  // TODO: Check that the generated messageHash matches that of the backend and otherwise throw

  msgDispatch(MsgEvent.PROPOSE, {
    messageHash: proposedMsg.messageHash,
  })
}

export const dispatchMsgConfirmation = (messageHash: Message['messageHash']) => {
  try {
    // TODO: Confirm and save response
  } catch (error) {
    msgDispatch(MsgEvent.CONFIRM_PROPOSE_FAILED, {
      messageHash,
      error: error as Error,
    })

    throw error
  }

  msgDispatch(MsgEvent.CONFIRM_PROPOSE, {
    messageHash,
  })
}
