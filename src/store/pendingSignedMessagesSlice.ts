import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '.'

type MessageHash = string

type PendingSignedMessagesState =
  | {
      [messageHash: MessageHash]: true
    }
  | Record<string, never>

const initialState: PendingSignedMessagesState = {}

export const pendingSignedMessagesSlice = createSlice({
  name: 'pendingSignedMessages',
  initialState,
  reducers: {
    setPendingSignedMessage: (state, action: PayloadAction<MessageHash>) => {
      state[action.payload] = true
    },
    clearPendingSignedMessage: (state, action: PayloadAction<MessageHash>) => {
      delete state[action.payload]
    },
  },
})

export const { setPendingSignedMessage, clearPendingSignedMessage } = pendingSignedMessagesSlice.actions

export const selectPendingSignedMessages = (state: RootState): PendingSignedMessagesState => {
  return state[pendingSignedMessagesSlice.name]
}

export const selectPendingSignedMessageByHash = createSelector(
  [selectPendingSignedMessages, (_: RootState, messageHash: MessageHash) => messageHash],
  (pendingSignedMessages, messageHash) => !!pendingSignedMessages[messageHash],
)
