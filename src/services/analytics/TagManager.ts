import Cookies from 'js-cookie'

import { IS_PRODUCTION } from '@/config/constants'

const TagManager = {
  dataLayer: (data: Record<string, any>) => {
    window.gtag?.(data)

    if (!IS_PRODUCTION) {
      console.info('[GTM] -', data)
    }
  },

  initialize: () => {
    // Consent mode
    window.gtag?.('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'denied',
      security_storage: 'granted',
      wait_for_update: 500,
    })
  },

  enableCookies: () => {
    window.gtag?.('consent', 'update', {
      analytics_storage: 'granted',
    })
  },

  disableCookies: () => {
    window.gtag?.('consent', 'update', {
      analytics_storage: 'denied',
    })

    const GA_COOKIE_LIST = ['_ga', '_gat', '_gid']
    const GA_PREFIX = '_ga_'
    const allCookies = document.cookie.split(';').map((cookie) => cookie.split('=')[0].trim())
    const gaCookies = allCookies.filter((cookie) => cookie.startsWith(GA_PREFIX))

    GA_COOKIE_LIST.concat(gaCookies).forEach((cookie) => {
      Cookies.remove(cookie, {
        path: '/',
        domain: `.${location.host.split('.').slice(-2).join('.')}`,
      })
    })

    // Injected script will remain in memory until new session
    location.reload()
  },

  setUserProperty: (name: string, value: string) => {
    window.gtag?.('set', 'user_properties', {
      [name]: value,
    })

    if (!IS_PRODUCTION) {
      console.info('[GTM] -', 'set user_properties', name, '=', value)
    }
  },
}

export default TagManager
