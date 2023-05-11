import type { SafeMessageListPage } from '@safe-global/safe-gateway-typescript-sdk'
import { isAllOf } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'

import { safeMsgDispatch, SafeMsgEvent } from '@/services/safe-messages/safeMsgEvents'
import { isSafeMessageListItem } from '@/utils/safe-message-guards'
import { makeLoadableSlice } from '@/store/common'
import { selectPendingSafeMessages } from '@/store/pendingSafeMessagesSlice'
import type { RootState } from '@/store'

const { slice, selector } = makeLoadableSlice('safeMessages', undefined as SafeMessageListPage | undefined)

export const safeMessagesSlice = slice
export const selectSafeMessages = selector

export const safeMessagesMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  if (isAllOf(safeMessagesSlice.actions.set)(action) && action.payload.data) {
    const state = store.getState()
    const pendingMsgs = selectPendingSafeMessages(state)

    for (const result of action.payload.data.results) {
      if (!isSafeMessageListItem(result)) {
        continue
      }

      const { messageHash } = result
      if (pendingMsgs[messageHash]) {
        safeMsgDispatch(SafeMsgEvent.UPDATED, { messageHash })
      }
    }
  }

  return result
}
