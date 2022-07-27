import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

export type SettingsState = {
  currency: string

  shortName: {
    show: boolean
    copy: boolean
  }
  theme: {
    darkMode?: boolean
  }
}

const initialState: SettingsState = {
  currency: 'usd',

  shortName: {
    show: true,
    copy: true,
  },
  theme: {
    darkMode: undefined,
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
    setDarkMode: (state, { payload }: PayloadAction<SettingsState['theme']['darkMode']>) => {
      state.theme.darkMode = payload
    },
  },
})

export const { setCurrency, setShowShortName, setCopyShortName, setDarkMode } = settingsSlice.actions

export const selectSettings = (state: RootState): SettingsState => state[settingsSlice.name]

export const selectCurrency = (state: RootState): SettingsState['currency'] => {
  return state[settingsSlice.name].currency
}
