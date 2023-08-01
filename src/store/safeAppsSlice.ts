import type { PayloadAction } from '@reduxjs/toolkit'
import { createSelector } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import type { RootState } from '@/store'

type SafeAppsPerChain = {
  pinned: Array<SafeAppData['id']>
}

export type SafeAppsState = {
  [chainId: string]: SafeAppsPerChain
} & { opened: Array<SafeAppData['id']> }

const initialState = {
  opened: [],
} as unknown as SafeAppsState

export const safeAppsSlice = createSlice({
  name: 'safeApps',
  initialState,
  reducers: {
    setPinned: (state, { payload }: PayloadAction<{ chainId: string; pinned: SafeAppsPerChain['pinned'] }>) => {
      const { pinned, chainId } = payload
      state[chainId] ??= { pinned: [] }

      state[chainId].pinned = pinned
    },
    markOpened: (state, { payload }: PayloadAction<{ id: SafeAppData['id'] }>) => {
      const { id } = payload
      state.opened ??= []

      if (!state.opened.includes(id)) {
        state.opened.push(id)
      }
    },
    setSafeApps: (_, { payload }: PayloadAction<SafeAppsState>) => {
      // We must return as we are overwriting the entire state
      return payload
    },
  },
})

export const { setPinned, markOpened } = safeAppsSlice.actions

export const selectSafeApps = (state: RootState): SafeAppsState => {
  return state[safeAppsSlice.name]
}

const selectSafeAppsPerChain = createSelector(
  [selectSafeApps, (_: RootState, chainId: string) => chainId],
  (safeApps, chainId) => {
    return safeApps[chainId]
  },
)

export const selectPinned = createSelector([selectSafeAppsPerChain], (safeAppsPerChain) => {
  return safeAppsPerChain?.pinned || []
})

export const selectOpened = createSelector([selectSafeApps], (safeApps) => {
  return safeApps?.opened || []
})
