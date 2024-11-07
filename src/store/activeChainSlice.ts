import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'
import { selectChainById } from './gateway/chains'

const initialState = { id: '1' }

const activeChainSlice = createSlice({
  name: 'txHistory',
  initialState,
  reducers: {
    switchActiveChain: (state, action: PayloadAction<{ id: string }>) => {
      return action.payload
    },
  },
})

export const { switchActiveChain } = activeChainSlice.actions

export const selectActiveChain = (state: RootState) => selectChainById(state, state.activeChain.id)
export const selectNativeCurrency = createSelector([selectActiveChain], ({ nativeCurrency }) => nativeCurrency)

export default activeChainSlice.reducer
