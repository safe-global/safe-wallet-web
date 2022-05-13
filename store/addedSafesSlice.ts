import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'

type AddedSafesState = {
  [chainId: string]: string[]
}

const initialState: AddedSafesState = {}

export const addedSafesSlice = createSlice({
  name: 'addedSafes',
  initialState,
  reducers: {
    addSafe: (state, { payload }: PayloadAction<{ chainId: string; address: string }>) => {
      state[payload.chainId] ??= []
      state[payload.chainId].push(payload.address)
    },
    removeSafe: (state, { payload }: PayloadAction<{ chainId: string; address: string }>) => {
      state[payload.chainId] = (state[payload.chainId] || []).filter((address) => address !== payload.address)
    },
  },
})

export const { addSafe, removeSafe } = addedSafesSlice.actions

const selectAllAddedSafes = (state: RootState): AddedSafesState => {
  return state[addedSafesSlice.name]
}

export const selectAddedSafes = createSelector(
  [selectAllAddedSafes, (_: RootState, chainId: string) => chainId],
  (allAddedSafes, chainId): string[] => {
    return allAddedSafes[chainId] || []
  },
)
