import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '.'

export enum CookieType {
  NECESSARY = 'necessary',
  UPDATES = 'updates',
  ANALYTICS = 'analytics',
}

export type CookiesState = Record<CookieType, boolean>

const initialState: CookiesState = {
  [CookieType.NECESSARY]: false,
  [CookieType.UPDATES]: false,
  [CookieType.ANALYTICS]: false,
}

export const cookiesSlice = createSlice({
  name: 'cookies',
  initialState,
  reducers: {
    saveCookieConsent: (_, { payload }: PayloadAction<CookiesState>) => {
      return payload
    },
  },
})

export const { saveCookieConsent } = cookiesSlice.actions

export const selectCookies = (state: RootState) => state[cookiesSlice.name]
