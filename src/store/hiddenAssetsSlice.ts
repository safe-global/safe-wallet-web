import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'

export type HiddenAssetsOnChain = {
  [tokenAddress: string]: string
}

export type HiddenAssetsState = {
  [chainId: string]: HiddenAssetsOnChain
}

const initialState: HiddenAssetsState = {}

export const hiddenAssetsSlice = createSlice({
  name: 'hiddenAssets',
  initialState,
  reducers: {
    addHiddenAssets: (state, action: PayloadAction<{ chainId: string; assets: string[] }>) => {
      const { payload } = action
      const { chainId, assets } = payload

      state[chainId] ??= {}
      assets.forEach((asset) => {
        state[chainId][asset] = asset
      })
    },

    removeHiddenAssets: (state, action: PayloadAction<{ chainId: string; assetAddresses: string[] }>) => {
      const { payload } = action
      const { chainId, assetAddresses } = payload

      assetAddresses.forEach((address) => {
        delete state[chainId]?.[address]

        if (Object.keys(state[chainId]).length === 0) {
          delete state[chainId]
        }
      })
    },
  },
})

export const { addHiddenAssets, removeHiddenAssets } = hiddenAssetsSlice.actions

export const selectAllHiddenAssets = (state: RootState): HiddenAssetsState => {
  return state[hiddenAssetsSlice.name]
}

export const selectHiddenAssetsPerChain = createSelector(
  [selectAllHiddenAssets, (_: RootState, chainId: string) => chainId],
  (allHiddenAssets, chainId): HiddenAssetsOnChain | undefined => {
    return allHiddenAssets[chainId]
  },
)
