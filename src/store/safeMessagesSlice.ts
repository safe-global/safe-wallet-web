import type { Page } from '@gnosis.pm/safe-react-gateway-sdk'
import type { AddressEx } from '@gnosis.pm/safe-react-gateway-sdk'
import type { Middleware } from '@reduxjs/toolkit'

import { safeMsgDispatch, SafeMsgEvent } from '@/services/safe-messages/safeMsgEvents'
import { isSafeMessageListItem } from '@/utils/safe-message-guards'
import { makeLoadableSlice } from '@/store/common'
import { selectPendinngSafeMessages } from '@/store/pendingSafeMessagesSlice'
import type { RootState } from '@/store'

// TODO: Export to gateway SDK
export enum SafeMessageListItemType {
  DATE_LABEL = 'DATE_LABEL',
  MESSAGE = 'MESSAGE',
}

export enum SafeMessageStatus {
  NEEDS_CONFIRMATION = 'NEEDS_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
}

export type SafeMessageDateLabel = {
  type: SafeMessageListItemType.DATE_LABEL
  timestamp: number
}

export type SafeMessage = {
  type: SafeMessageListItemType.MESSAGE
  messageHash: string
  status: SafeMessageStatus
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

export type SafeMessageListPage = Page<SafeMessageDateLabel | SafeMessage>

const { slice, selector } = makeLoadableSlice('safeMessages', undefined as SafeMessageListPage | undefined)

export const safeMessagesSlice = slice
export const selectSafeMessages = selector

export const safeMessagesMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  switch (action.type) {
    case safeMessagesSlice.actions.set.type: {
      const state = store.getState()
      const pendingMsgs = selectPendinngSafeMessages(state)
      const { payload } = action as ReturnType<typeof safeMessagesSlice.actions.set>

      if (!payload.data) {
        return
      }

      for (const result of payload.data.results) {
        if (!isSafeMessageListItem(result)) {
          continue
        }

        const { messageHash } = result
        if (pendingMsgs[messageHash]) {
          safeMsgDispatch(SafeMsgEvent.UPDATED, { messageHash })
        }
      }
    }
  }

  return result
}
