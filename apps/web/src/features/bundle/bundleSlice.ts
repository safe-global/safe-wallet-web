import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export type SafeEntry = {
  address: string
  chainId: string
}

export type Bundle = {
  id: string
  name: string
  safes: SafeEntry[]
}

export type BundleState = {
  [id: string]: Bundle
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
      const { id, name, safes } = payload

      state[id] = {
        id,
        name,
        safes,
      }
    },
    removeBundle: (state, { payload }: PayloadAction<Bundle>) => {
      const { id } = payload

      delete state[id]
    },
  },
})

export const { addBundle, removeBundle } = bundleSlice.actions

export const selectAllBundles = (state: RootState): BundleState => {
  return state[bundleSlice.name]
}
