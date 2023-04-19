import type { PayloadAction } from '@reduxjs/toolkit'
import { createSelector } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

type SafeAppsPerChain = {
  pinned: number[]
}

export type SafeAppsState = {
  [chainId: string]: SafeAppsPerChain
}

const initialState: SafeAppsState = {}

export const safeAppsSlice = createSlice({
  name: 'safeApps',
  initialState,
  reducers: {
    setPinned: (state, { payload }: PayloadAction<{ chainId: string; pinned: SafeAppsPerChain['pinned'] }>) => {
      const { pinned, chainId } = payload
      state[chainId] ??= { pinned: [] }
      state[chainId].pinned = pinned
    },
    setSafeApps: (state, { payload }: PayloadAction<SafeAppsState>) => {
      // We must return as we are overwriting the entire state
      return payload
    },
  },
})

export const { setPinned } = safeAppsSlice.actions

export const selectSafeApps = (state: RootState): SafeAppsState => {
  return state[safeAppsSlice.name]
}

export const selectPinned = createSelector(
  [selectSafeApps, (_: RootState, chainId: string) => chainId],
  (safeApps, chainId): SafeAppsPerChain['pinned'] => {
    const perChain = safeApps[chainId]
    return perChain?.pinned || []
  },
)
