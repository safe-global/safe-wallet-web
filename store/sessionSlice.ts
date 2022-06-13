import chains from '@/config/chains'
import useChainId from '@/services/useChainId'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { RootState, useAppSelector } from '.'

type SessionState = {
  currency: string
  lastChainId: string
  lastSafeAddress: Record<string, string>
}

const initialState: SessionState = {
  currency: 'usd',
  lastChainId: '',
  lastSafeAddress: {},
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

export const { setCurrency, setLastChainId, setLastSafeAddress } = sessionSlice.actions

export const selectSession = (state: RootState): SessionState => {
  return state[sessionSlice.name]
}

export const selectCurrency = (state: RootState): SessionState['currency'] => {
  return state[sessionSlice.name].currency
}

export const useLastSafeAddress = (): string | undefined => {
  const chainId = useChainId()
  const safeAddress = useAppSelector((state: RootState) => state[sessionSlice.name].lastSafeAddress[chainId])
  const prefix = Object.entries(chains).find(([, id]) => chainId === id)?.[0]
  return prefix && safeAddress ? `${prefix}:${safeAddress}` : undefined
}
