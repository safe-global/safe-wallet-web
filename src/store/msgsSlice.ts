import type { Page } from '@gnosis.pm/safe-react-gateway-sdk'
import type { AddressEx } from '@gnosis.pm/safe-react-gateway-sdk'
import type { Middleware } from '@reduxjs/toolkit'

import { msgDispatch, MsgEvent } from '@/services/msg/msgEvents'
import { isMessageListItem } from '@/utils/message-guards'
import { makeLoadableSlice } from '@/store/common'
import { selectPendingMsgs } from '@/store/pendingMsgsSlice'
import type { RootState } from '@/store'

// TODO: Export to gateway SDK
export enum MessageListItemType {
  DATE_LABEL = 'DATE_LABEL',
  MESSAGE = 'MESSAGE',
}

export enum MessageStatus {
  NEEDS_CONFIRMATION = 'NEEDS_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
}

export type MessageDateLabel = {
  type: MessageListItemType.DATE_LABEL
  timestamp: number
}

export type Message = {
  type: MessageListItemType.MESSAGE
  messageHash: string
  status: MessageStatus
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

export type MessageListPage = Page<MessageDateLabel | Message>

const { slice, selector } = makeLoadableSlice('msgs', undefined as MessageListPage | undefined)

export const msgsSlice = slice
export const selectMsgs = selector

export const msgsMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  switch (action.type) {
    case msgsSlice.actions.set.type: {
      const state = store.getState()
      const pendingMsgs = selectPendingMsgs(state)
      const { payload } = action as ReturnType<typeof msgsSlice.actions.set>

      if (!payload.data) {
        return
      }

      for (const result of payload.data.results) {
        if (!isMessageListItem(result)) {
          continue
        }

        const { messageHash } = result
        if (pendingMsgs[messageHash]) {
          msgDispatch(MsgEvent.UPDATED, { messageHash })
        }
      }
    }
  }

  return result
}
