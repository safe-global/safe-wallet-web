import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export type VisitedSafesState = {
  [chainId: string]: {
    [safeAddress: string]: {
      lastVisited: number
    }
  }
}

const initialState: VisitedSafesState = {}

export const visitedSafesSlice = createSlice({
  name: 'visitedSafes',
  initialState,
  reducers: {
    upsertVisitedSafe: (
      state,
      { payload }: PayloadAction<{ chainId: string; address: string; lastVisited: number }>,
    ) => {
      const { chainId, address, lastVisited } = payload
      state[chainId] ??= {}
      state[chainId][address] = { lastVisited }
    },
  },
})

export const { upsertVisitedSafe } = visitedSafesSlice.actions

export const selectAllVisitedSafes = (state: RootState): VisitedSafesState => {
  return state[visitedSafesSlice.name] || initialState
}
