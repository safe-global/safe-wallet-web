import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
// Possible type names:
// - VisitedSafesRecord - Emphasizes this tracks visited safes as a record/mapping
// - SafeAccessHistory - Focuses on the timestamp/history aspect
// - ChainSafeAccessMap - Describes the nested structure of chain->safe->access time
// - LastAccessedSafes - Simple and direct about what it contains
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
      console.log('upate visited safe', payload.address, payload.lastVisited)
      state[chainId] ??= {}
      state[chainId][address] = { lastVisited }
    },
  },
})

export const { upsertVisitedSafe } = visitedSafesSlice.actions

export const selectAllVisitedSafes = (state: RootState): VisitedSafesState => {
  return state[visitedSafesSlice.name] || initialState
}
