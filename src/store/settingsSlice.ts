import type { PayloadAction } from '@reduxjs/toolkit'
import { createSelector, createSlice } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import isEqual from 'lodash/isEqual'

export type EnvState = {
  tenderly: {
    url: string
    accessToken: string
  }
  rpc: {
    [chainId: string]: string
  }
}

export enum TOKEN_LISTS {
  TRUSTED = 'TRUSTED',
  ALL = 'ALL',
}

export type SettingsState = {
  currency: string

  hiddenTokens: {
    [chainId: string]: string[]
  }

  tokenList: TOKEN_LISTS

  shortName: {
    show: boolean
    copy: boolean
    qr: boolean
  }
  theme: {
    darkMode?: boolean
  }
  env: EnvState
}

const initialState: SettingsState = {
  currency: 'usd',

  tokenList: TOKEN_LISTS.TRUSTED,

  hiddenTokens: {},

  shortName: {
    show: true,
    copy: true,
    qr: true,
  },
  theme: {},
  env: {
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
      state.hiddenTokens[chainId] = assets
    },
    setTokenList: (state, { payload }: PayloadAction<SettingsState['tokenList']>) => {
      state.tokenList = payload
    },
    setEnv: (state, { payload }: PayloadAction<EnvState>) => {
      state.env = payload
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
  setTokenList,
  setEnv,
} = settingsSlice.actions

export const selectSettings = (state: RootState): SettingsState => state[settingsSlice.name]

export const selectCurrency = (state: RootState): SettingsState['currency'] => {
  return state[settingsSlice.name].currency || initialState.currency
}

export const selectTokenList = (state: RootState): SettingsState['tokenList'] => {
  return state[settingsSlice.name].tokenList || initialState.tokenList
}

export const selectHiddenTokensPerChain = (state: RootState, chainId: string): string[] => {
  return state[settingsSlice.name].hiddenTokens?.[chainId] || []
}

export const selectRpc = createSelector(selectSettings, (settings) => settings.env.rpc)

export const selectTenderly = createSelector(selectSettings, (settings) => settings.env.tenderly)

export const isEnvInitialState = createSelector(selectSettings, (settings) => isEqual(settings.env, initialState.env))
