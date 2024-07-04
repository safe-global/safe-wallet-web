import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '.'

export enum CookieAndTermType {
  TERMS = 'terms',
  NECESSARY = 'necessary',
  UPDATES = 'updates',
  ANALYTICS = 'analytics',
}

export type CookiesAndTermsState = Record<CookieAndTermType, boolean | undefined>

const initialState: CookiesAndTermsState = {
  [CookieAndTermType.TERMS]: undefined,
  [CookieAndTermType.NECESSARY]: undefined,
  [CookieAndTermType.UPDATES]: undefined,
  [CookieAndTermType.ANALYTICS]: undefined,
}

export const cookiesAndTermsSlice = createSlice({
  name: 'cookies_terms_v1',
  initialState,
  reducers: {
    saveCookieAndTermConsent: (_, { payload }: PayloadAction<CookiesAndTermsState>) => payload,
  },
})

export const { saveCookieAndTermConsent } = cookiesAndTermsSlice.actions

export const selectCookies = (state: RootState) => state[cookiesAndTermsSlice.name]
