import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'

interface SafeInfo {
  address: string
  chainId: string
}

const initialState: SafeInfo = {
  address: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
  chainId: '1',
}

const activeSafeSlice = createSlice({
  name: 'activeSafe',
  initialState,
  reducers: {
    setActiveSafe: (state, action: PayloadAction<SafeInfo>) => {
      return action.payload
    },
    clearActiveSafe: () => {
      return initialState
    },
  },
})

export const { setActiveSafe, clearActiveSafe } = activeSafeSlice.actions

export const selectActiveSafe = (state: RootState) => state.activeSafe

export default activeSafeSlice.reducer
