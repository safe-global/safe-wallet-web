import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

export type SettingsState = {
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
  shortName: {
    show: true,
    copy: true,
    qr: true,
  },
  theme: {
    darkMode: undefined,
  },
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
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
  },
})

export const { setShowShortName, setCopyShortName, setQrShortName, setDarkMode } = settingsSlice.actions

export const selectSettings = (state: RootState): SettingsState => state[settingsSlice.name]
