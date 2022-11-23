import type { Page } from '@gnosis.pm/safe-react-gateway-sdk'
import type { AddressEx } from '@gnosis.pm/safe-react-gateway-sdk'
import type { Middleware } from '@reduxjs/toolkit'

import { signedMessageDispatch, SignedMessageEvent } from '@/services/signed-messages/signedMessageEvents'
import { isMessageListItem } from '@/utils/signed-message-guards'
import { makeLoadableSlice } from '@/store/common'
import { selectPendingSignedMessages } from '@/store/pendingSignedMessagesSlice'
import type { RootState } from '@/store'

// TODO: Export to gateway SDK
export enum SignedMessageListItemType {
  DATE_LABEL = 'DATE_LABEL',
  MESSAGE = 'MESSAGE',
}

export enum SignedMessageStatus {
  NEEDS_CONFIRMATION = 'NEEDS_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
}

export type SignedMessageDateLabel = {
  type: SignedMessageListItemType.DATE_LABEL
  timestamp: number
}

export type SignedMessage = {
  type: SignedMessageListItemType.MESSAGE
  messageHash: string
  status: SignedMessageStatus
  logoUri: string // Implementation may change
  name: string // Implementation may change
  message: string | Record<string, unknown>
  creationTimestamp: number
  modifiedTimestamp: number
  confirmationsSubmitted: number
  confirmationsRequired: number
  confirmations: {
    owner: AddressEx
    signature: string
  }[]
  proposedBy: AddressEx
  preparedSignature: string | null // Name subject to change
}

export type SignedMessageListPage = Page<SignedMessageDateLabel | SignedMessage>

const { slice, selector } = makeLoadableSlice('signedMessages', undefined as SignedMessageListPage | undefined)

export const signedMessagesSlice = slice
export const selectSignedMessages = selector

export const signedMessagesMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  switch (action.type) {
    case signedMessagesSlice.actions.set.type: {
      const state = store.getState()
      const pendingMsgs = selectPendingSignedMessages(state)
      const { payload } = action as ReturnType<typeof signedMessagesSlice.actions.set>

      if (!payload.data) {
        return
      }

      for (const result of payload.data.results) {
        if (!isMessageListItem(result)) {
          continue
        }

        const { messageHash } = result
        if (pendingMsgs[messageHash]) {
          signedMessageDispatch(SignedMessageEvent.UPDATED, { messageHash })
        }
      }
    }
  }

  return result
}
