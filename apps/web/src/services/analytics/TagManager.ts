import Cookies from 'js-cookie'

import { IS_PRODUCTION } from '@/config/constants'

export type TagManagerArgs = {
  // GTM id, e.g. GTM-000000
  gtmId: string
  // GTM authentication key
  auth: string
  // GTM environment, e.g. env-00.
  preview: string
}

const DATA_LAYER_NAME = 'dataLayer'

const TagManager = {
  // `jest.spyOn` is not possible if outside of `TagManager`
  _getScript: ({ gtmId, auth, preview }: TagManagerArgs) => {
    const script = document.createElement('script')

    const gtmScript = `
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl + '&gtm_auth=${auth}&gtm_preview=${preview}&gtm_cookies_win=x';
        f.parentNode.insertBefore(j, f);
      })(window, document, 'script', '${DATA_LAYER_NAME}', '${gtmId}');`

    script.innerHTML = gtmScript

    return script
  },

  dataLayer: (data: Record<string, any>) => {
    window[DATA_LAYER_NAME] = window[DATA_LAYER_NAME] || []
    window[DATA_LAYER_NAME].push(data)

    if (!IS_PRODUCTION) {
      console.info('[GTM] -', data)
    }
  },

  initialize: (args: TagManagerArgs) => {
    window[DATA_LAYER_NAME] = window[DATA_LAYER_NAME] || []
    // This function MUST be in `window`, otherwise GTM Consent Mode just doesn't work
    window.gtag = function () {
      window[DATA_LAYER_NAME]?.push(arguments)
    }

    // Consent mode
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'denied',
      security_storage: 'granted',
      wait_for_update: 500,
    })

    TagManager.dataLayer({
      // Block JS variables and custom scripts
      // @see https://developers.google.com/tag-platform/tag-manager/web/restrict
      'gtm.blocklist': ['j', 'jsm', 'customScripts'],
      pageLocation: `${location.origin}${location.pathname}`,
      pagePath: location.pathname,
    })

    const script = TagManager._getScript(args)

    // Initialize GTM. This pushes the default dataLayer event:
    // { "gtm.start": new Date().getTime(), event: "gtm.js" }
    document.head.insertBefore(script, document.head.childNodes[0])
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
