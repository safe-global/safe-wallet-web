import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '.'

type MessageHash = string

type PendingMsgsState =
  | {
      [messageHash: MessageHash]: true
    }
  | Record<string, never>

const initialState: PendingMsgsState = {}

export const pendingMsgsSlice = createSlice({
  name: 'pendingMsgs',
  initialState,
  reducers: {
    setPendingMsg: (state, action: PayloadAction<MessageHash>) => {
      state[action.payload] = true
    },
    // TODO: Clear when messages are fetched in middleware
    clearPendingMsg: (state, action: PayloadAction<MessageHash>) => {
      delete state[action.payload]
    },
  },
})

export const { setPendingMsg, clearPendingMsg } = pendingMsgsSlice.actions

const selectPendingMsgs = (state: RootState): PendingMsgsState => {
  return state[pendingMsgsSlice.name]
}

export const selectPendingMsgByHash = createSelector(
  [selectPendingMsgs, (_: RootState, messageHash: MessageHash) => messageHash],
  (pendingMsgs, messageHash) => !!pendingMsgs[messageHash],
)
