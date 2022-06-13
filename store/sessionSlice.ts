import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'

type SessionState = {
  currency: string
  lastChainId: string
  lastSafeAddress: Record<string, string>
  lastWallet: string
}

const initialState: SessionState = {
  currency: 'usd',
  lastChainId: '',
  lastSafeAddress: {},
  lastWallet: '',
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<SessionState['currency']>) => {
      state.currency = action.payload
    },
    setLastWallet: (state, action: PayloadAction<SessionState['lastWallet']>) => {
      state.lastWallet = action.payload
    },
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
  },
})

export const { setCurrency, setLastChainId, setLastSafeAddress, setLastWallet } = sessionSlice.actions

export const selectSession = (state: RootState): SessionState => {
  return state[sessionSlice.name]
}

export const selectCurrency = (state: RootState): SessionState['currency'] => {
  return state[sessionSlice.name].currency
}

export const selectLastSafeAddress = createSelector(
  [selectSession, (_, chainId: string) => chainId],
  (session, chainId): string | undefined => {
    return session.lastSafeAddress[chainId]
  },
)
