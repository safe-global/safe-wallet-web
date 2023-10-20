import { popupSlice, PopupType } from '@/store/popupSlice'
import { CookieType } from '../cookiesSlice'

describe('popupSlice', () => {
  it('should open the cookie banner', () => {
    const initialState = {
      [PopupType.COOKIES]: { open: false },
      [PopupType.WALLET_CONNECT]: { open: false },
    }
    const { reducer, actions } = popupSlice
    const newState = reducer(initialState, actions.openCookieBanner({ warningKey: CookieType.ANALYTICS }))
    expect(newState[PopupType.COOKIES]).toEqual({ open: true, warningKey: CookieType.ANALYTICS })
  })

  it('should close the cookie banner', () => {
    const initialState = {
      [PopupType.COOKIES]: { open: true },
      [PopupType.WALLET_CONNECT]: { open: false },
    }
    const { reducer, actions } = popupSlice
    const newState = reducer(initialState, actions.closeCookieBanner())
    expect(newState[PopupType.COOKIES]).toEqual({ open: false })
  })

  it('should open the wallet connect popup', () => {
    const initialState = {
      [PopupType.COOKIES]: { open: false },
      [PopupType.WALLET_CONNECT]: { open: false },
    }
    const { reducer, actions } = popupSlice
    const newState = reducer(initialState, actions.openWalletConnect())
    expect(newState[PopupType.WALLET_CONNECT]).toEqual({ open: true })
  })

  it('should close the wallet connect popup', () => {
    const initialState = {
      [PopupType.COOKIES]: { open: false },
      [PopupType.WALLET_CONNECT]: { open: true },
    }
    const { reducer, actions } = popupSlice
    const newState = reducer(initialState, actions.closeWalletConnect())
    expect(newState[PopupType.WALLET_CONNECT]).toEqual({ open: false })
  })
})
