import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { merge } from 'lodash'
import type { RootState } from '.'

export type SessionState = {
  lastChainId: string
  lastSafeAddress: { [chainId: string]: string }
}

const initialState: SessionState = {
  lastChainId: '',
  lastSafeAddress: {},
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setLastChainId: (state, action: PayloadAction<SessionState['lastChainId']>) => {
      state.lastChainId = action.payload
    },
    setLastSafeAddress: (
      state,
      action: PayloadAction<{
        chainId: string
        safeAddress: string
      }>,
    ) => {
      const { chainId, safeAddress } = action.payload
      state.lastSafeAddress[chainId] = safeAddress
    },
    setSession: (state, { payload }: PayloadAction<SessionState>) => {
      // Preserve default `lastSafeAddress` if importing without
      state = merge({}, initialState, payload)
    },
  },
})

export const { setLastChainId, setLastSafeAddress } = sessionSlice.actions

export const selectSession = (state: RootState): SessionState => {
  return state[sessionSlice.name]
}

export const selectLastSafeAddress = createSelector(
  [selectSession, (_, chainId: string) => chainId],
  (session, chainId): string | undefined => {
    return session.lastSafeAddress[chainId]
  },
)
