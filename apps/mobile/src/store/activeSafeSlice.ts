import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'
import { mockedActiveAccount } from './constants'
import { SafeInfo } from '../types/address'

const initialState: SafeInfo = {
  address: mockedActiveAccount.address,
  chainId: mockedActiveAccount.chainId,
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
