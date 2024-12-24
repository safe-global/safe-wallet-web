import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'
import { selectChainById } from './chains'
import { mockedActiveAccount } from './constants'

const initialState = { id: mockedActiveAccount.chainId }

const activeChainSlice = createSlice({
  name: 'activeChain',
  initialState,
  reducers: {
    switchActiveChain: (state, action: PayloadAction<{ id: string }>) => {
      return action.payload
    },
  },
})

export const { switchActiveChain } = activeChainSlice.actions

export const selectActiveChain = (state: RootState) => selectChainById(state, state.activeChain.id)
export const selectNativeCurrency = createSelector([selectActiveChain], (activeChain) => activeChain?.nativeCurrency)

export default activeChainSlice.reducer
