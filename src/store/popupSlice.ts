import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { CookieType } from './cookiesSlice'
import type { RootState } from '.'

export enum PopupType {
  COOKIES = 'cookies',
  WALLET_CONNECT = 'walletConnect',
}

type PopupState = {
  [PopupType.COOKIES]: {
    open: boolean
    warningKey?: CookieType
  }
  [PopupType.WALLET_CONNECT]: {
    open: boolean
  }
}

const initialState: PopupState = {
  [PopupType.COOKIES]: {
    open: false,
  },
  [PopupType.WALLET_CONNECT]: {
    open: false,
  },
}

export const popupSlice = createSlice({
  name: 'popups',
  initialState,
  reducers: {
    openCookieBanner: (state, { payload }: PayloadAction<{ warningKey?: CookieType }>) => {
      state[PopupType.COOKIES] = {
        ...payload,
        open: true,
      }
    },
    closeCookieBanner: (state) => {
      state[PopupType.COOKIES] = { open: false }
    },
    openWalletConnect: (state) => {
      state[PopupType.WALLET_CONNECT] = { open: true }
    },
    closeWalletConnect: (state) => {
      state[PopupType.WALLET_CONNECT] = { open: false }
    },
  },
})

export const { openCookieBanner, closeCookieBanner, openWalletConnect, closeWalletConnect } = popupSlice.actions

export const selectCookieBanner = (state: RootState) => state[popupSlice.name][PopupType.COOKIES]
export const selectWalletConnectPopup = (state: RootState) => state[popupSlice.name][PopupType.WALLET_CONNECT]
