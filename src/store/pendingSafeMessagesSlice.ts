import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '.'

type MessageHash = string

type PendingSafeMessagesState =
  | {
      [messageHash: MessageHash]: true
    }
  | Record<string, never>

const initialState: PendingSafeMessagesState = {}

export const pendingSafeMessagesSlice = createSlice({
  name: 'pendingSafeMessages',
  initialState,
  reducers: {
    setPendingSafeMessage: (state, action: PayloadAction<MessageHash>) => {
      state[action.payload] = true
    },
    clearPendingSafeMessage: (state, action: PayloadAction<MessageHash>) => {
      delete state[action.payload]
    },
  },
})

export const { setPendingSafeMessage, clearPendingSafeMessage } = pendingSafeMessagesSlice.actions

export const selectPendinngSafeMessages = (state: RootState): PendingSafeMessagesState => {
  return state[pendingSafeMessagesSlice.name]
}

export const selectPendingSafeMessageByHash = createSelector(
  [selectPendinngSafeMessages, (_: RootState, messageHash: MessageHash) => messageHash],
  (pendingSignedMessages, messageHash) => !!pendingSignedMessages[messageHash],
)
