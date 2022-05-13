import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'
import { IS_PRODUCTION } from '@/config/constants'
import chains from '@/config/chains'

interface CurrentSessionState {
  chainId: string
}

const initialState: CurrentSessionState = {
  chainId: IS_PRODUCTION ? chains.eth : chains.rin,
}

export const currentSessionSlice = createSlice({
  name: 'currentSession',
  initialState,
  reducers: {
    setCurrentSession: (_, action: PayloadAction<CurrentSessionState>): CurrentSessionState => {
      return action.payload
    },
    setCurrentChainId: (state, action: PayloadAction<CurrentSessionState['chainId']>): CurrentSessionState => {
      state.chainId = action.payload
      return state
    },
  },
})

export const { setCurrentSession, setCurrentChainId } = currentSessionSlice.actions

export const selectCurrentSession = (state: RootState): CurrentSessionState => {
  return state[currentSessionSlice.name]
}

export const selectCurrentChainId = createSelector(selectCurrentSession, (currentSession) => {
  return currentSession.chainId
})
