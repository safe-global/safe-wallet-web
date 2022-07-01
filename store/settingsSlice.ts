import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

const initialState = {
  shortName: {
    show: true,
    copy: true,
  },
  // TODO:
  theme: {
    darkMode: false,
  },
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setShowShortName: (state, { payload }: PayloadAction<boolean>) => {
      state.shortName.show = payload
    },
    setCopyShortName: (state, { payload }: PayloadAction<boolean>) => {
      state.shortName.copy = payload
    },
    setDarkMode: (state, { payload }: PayloadAction<boolean>) => {
      state.theme.darkMode = payload
    },
  },
})

export const { setShowShortName, setCopyShortName, setDarkMode } = settingsSlice.actions

export const selectSettings = (state: RootState) => state[settingsSlice.name]
