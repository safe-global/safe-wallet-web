import type { PayloadAction } from '@reduxjs/toolkit'
import { createSelector, createSlice } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import isEqual from 'lodash/isEqual'

export type SettingsState = {
  currency: string

  hiddenTokens:
    | {
        [chainId: string]: string[]
      }
    | undefined /* This was added to the slice later, so hydration will set it to undefined initially */

  shortName: {
    show: boolean
    copy: boolean
    qr: boolean
  }
  theme: {
    darkMode?: boolean
  }
  env: {
    cgw?: string
    tenderly: {
      url?: string
      accessToken?: string
    }
    rpc: {
      [chainId: string]: string
    }
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
  env: {
    cgw: '',
    rpc: {},
    tenderly: {
      url: '',
      accessToken: '',
    },
  },
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
      state.hiddenTokens ??= {}
      state.hiddenTokens[chainId] = assets
    },
    setCgw: (state, { payload }: PayloadAction<SettingsState['env']['cgw']>) => {
      state.env.cgw = payload
    },
    setRpc: (state, { payload }: PayloadAction<{ chainId: string; rpc: string }>) => {
      const { chainId, rpc } = payload
      state.env.rpc ??= {}

      if (rpc) {
        state.env.rpc[chainId] = rpc
      }
    },
    setTenderly: (state, { payload }: PayloadAction<SettingsState['env']['tenderly']>) => {
      state.env.tenderly = payload
    },
  },
})

export const {
  setCurrency,
  setShowShortName,
  setCopyShortName,
  setQrShortName,
  setDarkMode,
  setHiddenTokensForChain,
  setCgw,
  setRpc,
  setTenderly,
} = settingsSlice.actions

export const selectSettings = (state: RootState): SettingsState => state[settingsSlice.name]

export const selectCurrency = (state: RootState): SettingsState['currency'] => {
  return state[settingsSlice.name].currency || initialState.currency
}

export const selectHiddenTokensPerChain = (state: RootState, chainId: string): string[] => {
  return state[settingsSlice.name].hiddenTokens?.[chainId] || []
}

export const selectCgw = createSelector(selectSettings, (settings) => settings.env.cgw)

export const selectRpc = createSelector(selectSettings, (settings) => settings.env.rpc)

export const selectTenderly = createSelector(selectSettings, (settings) => settings.env.tenderly)

export const isEnvInitialState = createSelector(selectSettings, (settings) => isEqual(settings.env, initialState.env))
