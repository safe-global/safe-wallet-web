import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export type SafeAppsState = {
  pinned: number[]
}

const initialState: SafeAppsState = {
  pinned: [],
}

export const safeAppsSlice = createSlice({
  name: 'safeApps',
  initialState,
  reducers: {
    setPinned: (state, { payload }: PayloadAction<SafeAppsState['pinned']>) => {
      state.pinned = payload
    },
  },
})

export const { setPinned } = safeAppsSlice.actions

export const selectPinned = (state: RootState): SafeAppsState['pinned'] => {
  return state[safeAppsSlice.name].pinned || initialState.pinned
}
