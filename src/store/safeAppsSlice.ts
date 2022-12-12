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
  },
})

export const { setPinned } = safeAppsSlice.actions

export const selectPinned = createSelector(
  [(state: RootState) => state, (_: RootState, chainId: string) => chainId],
  (state, chainId): SafeAppsPerChain['pinned'] => {
    const perChain = state[safeAppsSlice.name][chainId]
    return perChain?.pinned || []
  },
)
