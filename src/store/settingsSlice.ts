import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

export type SettingsState = {
  currency: string

  hiddenTokens: {
    [chainId: string]: string[]
  }

  shortName: {
    show: boolean
    copy: boolean
    qr: boolean
  }
  theme: {
    darkMode?: boolean
  }
}

const initialState: SettingsState = {
  currency: 'usd',

  hiddenTokens: {},

  shortName: {
    show: true,
    copy: true,
    qr: true,
  },
  theme: {},
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setCurrency: (state, { payload }: PayloadAction<SettingsState['currency']>) => {
      state.currency = payload
    },
    setShowShortName: (state, { payload }: PayloadAction<SettingsState['shortName']['show']>) => {
      state.shortName.show = payload
    },
    setCopyShortName: (state, { payload }: PayloadAction<SettingsState['shortName']['copy']>) => {
      state.shortName.copy = payload
    },
    setQrShortName: (state, { payload }: PayloadAction<SettingsState['shortName']['qr']>) => {
      state.shortName.qr = payload
    },
    setDarkMode: (state, { payload }: PayloadAction<SettingsState['theme']['darkMode']>) => {
      state.theme.darkMode = payload
    },
    setHiddenTokensForChain: (state, { payload }: PayloadAction<{ chainId: string; assets: string[] }>) => {
      const { chainId, assets } = payload
      state.hiddenTokens[chainId] = assets
    },
  },
})

export const { setCurrency, setShowShortName, setCopyShortName, setQrShortName, setDarkMode, setHiddenTokensForChain } =
  settingsSlice.actions

export const selectSettings = (state: RootState): SettingsState => state[settingsSlice.name]

export const selectCurrency = (state: RootState): SettingsState['currency'] => {
  return state[settingsSlice.name].currency || initialState.currency
}

export const selectHiddenTokensPerChain = (state: RootState, chainId: string): string[] => {
  return state[settingsSlice.name].hiddenTokens?.[chainId] || []
}
