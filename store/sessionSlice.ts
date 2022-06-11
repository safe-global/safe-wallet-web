import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'

type SessionState = {
  currency: string
  lastChainId: string
  lastSafeAddress: string
}

const initialState: SessionState = {
  currency: 'usd',
  lastChainId: '',
  lastSafeAddress: '',
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<SessionState['currency']>) => {
      state.currency = action.payload
    },
    setLastChainId: (state, action: PayloadAction<SessionState['lastChainId']>) => {
      state.lastChainId = action.payload
    },
    setLastSafeAddress: (state, action: PayloadAction<SessionState['lastSafeAddress']>) => {
      state.lastSafeAddress = action.payload
    },
  },
})

export const { setCurrency, setLastChainId, setLastSafeAddress } = sessionSlice.actions

export const selectSession = (state: RootState): SessionState => {
  return state[sessionSlice.name]
}

export const selectCurrency = (state: RootState): SessionState['currency'] => {
  return state[sessionSlice.name].currency
}
