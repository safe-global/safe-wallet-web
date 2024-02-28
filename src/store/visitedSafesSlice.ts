import type { PayloadAction } from '@reduxjs/toolkit'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export type VisitedSafe = {
  chainId: string
  address: string
  isWatchlist: boolean
  threshold?: number
  owners?: number
  lastAccessed: number
}
export type VisitedSafesState = {
  safes: { [safeAddress: string]: VisitedSafe }
}

const initialState: VisitedSafesState = {
  safes: {},
}

export const visitedSafesSlice = createSlice({
  name: 'visitedSafes',
  initialState,
  reducers: {
    setVisitedSafe: (state, { payload }: PayloadAction<VisitedSafe>) => {
      console.log('upate visited safe', payload.address, payload.lastAccessed)
      state.safes[payload.address] = payload
    },
  },
})

export const { setVisitedSafe } = visitedSafesSlice.actions

export const selectAllVisitedSafes = (state: RootState): VisitedSafesState['safes'] =>
  state[visitedSafesSlice.name].safes || initialState.safes

export const selectAllVisitedSafesOrderedByTimestamp = createSelector(selectAllVisitedSafes, (safes) => {
  return Object.values(safes).sort((a, b) => b.lastAccessed - a.lastAccessed)
})
