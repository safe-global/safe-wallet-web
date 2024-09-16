import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '.'

export enum CookieAndTermType {
  TERMS = 'terms',
  NECESSARY = 'necessary',
  UPDATES = 'updates',
  ANALYTICS = 'analytics',
  VERSION = 'version',
}

export type CookiesAndTermsState = {
  [CookieAndTermType.TERMS]: boolean | undefined
  [CookieAndTermType.NECESSARY]: boolean | undefined
  [CookieAndTermType.UPDATES]: boolean | undefined
  [CookieAndTermType.ANALYTICS]: boolean | undefined
  [CookieAndTermType.VERSION]: string | undefined
}

const initialState: CookiesAndTermsState = {
  [CookieAndTermType.TERMS]: undefined,
  [CookieAndTermType.NECESSARY]: undefined,
  [CookieAndTermType.UPDATES]: undefined,
  [CookieAndTermType.ANALYTICS]: undefined,
  [CookieAndTermType.VERSION]: undefined,
}

export const cookiesAndTermsSlice = createSlice({
  name: 'cookies_terms_v1.2',
  initialState,
  reducers: {
    saveCookieAndTermConsent: (_, { payload }: PayloadAction<CookiesAndTermsState>) => payload,
  },
})

export const { saveCookieAndTermConsent } = cookiesAndTermsSlice.actions

export const selectCookies = (state: RootState) => state[cookiesAndTermsSlice.name]
