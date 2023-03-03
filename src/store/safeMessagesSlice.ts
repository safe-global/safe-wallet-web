import type { SafeMessageListPage } from '@safe-global/safe-gateway-typescript-sdk'
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

  switch (action.type) {
    case safeMessagesSlice.actions.set.type: {
      const state = store.getState()
      const pendingMsgs = selectPendingSafeMessages(state)
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
