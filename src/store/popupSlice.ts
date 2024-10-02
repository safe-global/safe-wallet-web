import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { CookieAndTermType } from './cookiesAndTermsSlice'
import type { RootState } from '.'

export enum PopupType {
  COOKIES = 'cookies',
  OUTREACH = 'outreach',
}

type PopupState = {
  [PopupType.COOKIES]: {
    open: boolean
    warningKey?: CookieAndTermType
  }
  [PopupType.OUTREACH]: {
    open: boolean
  }
}

const initialState: PopupState = {
  [PopupType.COOKIES]: {
    open: false,
  },
  [PopupType.OUTREACH]: {
    open: false,
  },
}

export const popupSlice = createSlice({
  name: 'popups',
  initialState,
  reducers: {
    openCookieBanner: (state, { payload }: PayloadAction<{ warningKey?: CookieAndTermType }>) => {
      state[PopupType.COOKIES] = {
        ...payload,
        open: true,
      }
    },
    closeCookieBanner: (state) => {
      state[PopupType.COOKIES] = { open: false }
    },
    openOutreachBanner: (state) => {
      state[PopupType.OUTREACH] = { open: true }
    },
    closeOutreachBanner: (state) => {
      state[PopupType.OUTREACH] = { open: false }
    },
  },
})

export const { openCookieBanner, closeCookieBanner, openOutreachBanner, closeOutreachBanner } = popupSlice.actions

export const selectCookieBanner = (state: RootState) => state[popupSlice.name][PopupType.COOKIES]
export const selectOutreachBanner = (state: RootState) => state[popupSlice.name][PopupType.OUTREACH]
