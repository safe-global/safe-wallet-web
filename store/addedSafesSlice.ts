import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import type { RootState } from '.'

type AddedSafesState = {
  [chainId: string]: {
    [safeAddress: string]: SafeInfo
  }
}

const initialState: AddedSafesState = {}

export const addedSafesSlice = createSlice({
  name: 'addedSafes',
  initialState,
  reducers: {
    addOrUpdateSafe: (state, { payload }: PayloadAction<{ chainId: string; safe: SafeInfo }>) => {
      const { chainId, safe } = payload

      state[chainId] ??= {}
      state[chainId][safe.address.value] = safe
    },
    removeSafe: (state, { payload }: PayloadAction<{ chainId: string; address: string }>) => {
      const { chainId, address } = payload

      delete state[chainId][address]

      if (Object.keys(state[chainId]).length === 0) {
        delete state[chainId]
      }
    },
  },
})

export const { addOrUpdateSafe, removeSafe } = addedSafesSlice.actions

export const selectAllAddedSafes = (state: RootState): AddedSafesState => {
  return state[addedSafesSlice.name]
}

export const selectAddedSafes = createSelector(
  [selectAllAddedSafes, (_: RootState, chainId: string) => chainId],
  (allAddedSafes, chainId) => {
    return allAddedSafes[chainId]
  },
)
