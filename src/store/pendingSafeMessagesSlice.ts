import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '.'

export type PendingSafeMessagesState =
  | {
      [messageHash: string]: true
    }
  | Record<string, never>

const initialState: PendingSafeMessagesState = {}

export const pendingSafeMessagesSlice = createSlice({
  name: 'pendingSafeMessages',
  initialState,
  reducers: {
    setPendingSafeMessage: (state, action: PayloadAction<string>) => {
      state[action.payload] = true
    },
    clearPendingSafeMessage: (state, action: PayloadAction<string>) => {
      delete state[action.payload]
    },
  },
})

export const { setPendingSafeMessage, clearPendingSafeMessage } = pendingSafeMessagesSlice.actions

export const selectPendingSafeMessages = (state: RootState): PendingSafeMessagesState => {
  return state[pendingSafeMessagesSlice.name]
}

export const selectPendingSafeMessageByHash = createSelector(
  [selectPendingSafeMessages, (_: RootState, messageHash: string) => messageHash],
  (pendingSignedMessages, messageHash) => !!pendingSignedMessages[messageHash],
)
