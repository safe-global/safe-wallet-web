import { isBeamerLoaded, loadBeamer, unloadBeamer } from '@/services/beamer'
import { createSlice, Middleware, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'

export const NECESSARY_COOKIE = 'necessary'
export const SUPPORT_COOKIE = 'supportAndCommunity'
export const ANALYTICS_COOKIE = 'analytics'

export type CookiesConsent = {
  [NECESSARY_COOKIE]: boolean
  [SUPPORT_COOKIE]: boolean
  [ANALYTICS_COOKIE]: boolean
}

type CookiesBannerState = {
  open: boolean
  consent: CookiesConsent
  warningKey?: keyof CookiesConsent
}

const initialState: CookiesBannerState = {
  open: true,
  consent: {
    [NECESSARY_COOKIE]: true,
    [SUPPORT_COOKIE]: false,
    [ANALYTICS_COOKIE]: false,
  },
}

export const cookiesSlice = createSlice({
  name: 'cookies',
  initialState,
  reducers: {
    closeCookiesBanner: (state) => {
      state.open = false
      delete state.warningKey
    },
    openCookiesBanner: (state, action?: PayloadAction<{ consentWarning: keyof CookiesConsent }>) => {
      state.open = true
      if (action?.payload.consentWarning) {
        state.warningKey = action.payload.consentWarning
      }
    },
    saveCookiesConsent: (state, { payload }: PayloadAction<{ consent: CookiesConsent }>) => {
      state.consent = payload.consent
    },
  },
})

export const { closeCookiesBanner, openCookiesBanner, saveCookiesConsent } = cookiesSlice.actions

export const selectCookies = (state: RootState) => state[cookiesSlice.name]

export const cookiesMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  switch (action.type) {
    case saveCookiesConsent.type: {
      const state = store.getState()

      if (state.cookies.consent.supportAndCommunity) {
        if (!isBeamerLoaded()) {
          loadBeamer()
        }
      } else {
        unloadBeamer()
      }

      if (state.cookies.consent.analytics) {
        // TODO: If Analytics isn't loaded, load
      } else {
        // TODO: Unload Analytics
      }
    }
  }

  return result
}
