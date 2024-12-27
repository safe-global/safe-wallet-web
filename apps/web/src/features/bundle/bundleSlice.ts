import type { SafeEntry } from '@/features/bundle/CreateBundle'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export type Bundle = {
  name: string
  safes: SafeEntry[]
}

export type BundleState = {
  [name: string]: Bundle
}

const initialState: BundleState = {}

export const bundleSlice = createSlice({
  name: 'bundles',
  initialState,
  reducers: {
    setBundles: (_, action: PayloadAction<BundleState>) => {
      return action.payload
    },
    addBundle: (state, { payload }: PayloadAction<Bundle>) => {
      const { name, safes } = payload

      state[name] = {
        name,
        safes,
      }
    },
    removeBundle: (state, { payload }: PayloadAction<Bundle>) => {
      const { name } = payload

      delete state[name]
    },
  },
})

export const { addBundle } = bundleSlice.actions

export const selectAllBundles = (state: RootState): BundleState => {
  return state[bundleSlice.name]
}
