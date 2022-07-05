import { isBeamerLoaded, loadBeamer, unloadBeamer } from '@/services/beamer'
import { createSlice, Middleware, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'

export enum CookieType {
  NECESSARY_COOKIE = 'necessary',
  UPDATES_COOKIE = 'updates',
  ANALYTICS_COOKIE = 'analytics',
}

type CookiesState = Record<CookieType, boolean>

const initialState: CookiesState = {
  [CookieType.NECESSARY_COOKIE]: false,
  [CookieType.UPDATES_COOKIE]: false,
  [CookieType.ANALYTICS_COOKIE]: false,
}

export const cookiesSlice = createSlice({
  name: 'cookies',
  initialState,
  reducers: {
    saveCookieConsent: (state, { payload }: PayloadAction<{ consent: CookiesState }>) => {
      return payload.consent
    },
  },
})

export const { saveCookieConsent } = cookiesSlice.actions

export const selectCookies = (state: RootState) => state[cookiesSlice.name]

export const cookiesMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  switch (action.type) {
    case saveCookieConsent.type: {
      const state = store.getState()

      if (state.cookies[CookieType.UPDATES_COOKIE]) {
        if (!isBeamerLoaded()) {
          loadBeamer()
        }
      } else {
        unloadBeamer()
      }

      if (state.cookies[CookieType.ANALYTICS_COOKIE]) {
        // TODO: If Analytics isn't loaded, load
      } else {
        // TODO: Unload Analytics
      }
    }
  }

  return result
}
