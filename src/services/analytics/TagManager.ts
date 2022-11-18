import { GOOGLE_ANALYTICS_MEASUREMENT_ID, IS_PRODUCTION } from '@/config/constants'
import Cookies from 'js-cookie'

type DataLayer = Record<string, unknown>

export type TagManagerArgs = {
  // GTM id, e.g. GTM-000000
  gtmId: string
  // GTM authetication key
  auth: string
  // GTM environment, e.g. env-00.
  preview: string
  // Object that contains all of the information that you want to pass to GTM
  dataLayer?: DataLayer
}

const DATA_LAYER_NAME = 'dataLayer'

// Initialization scripts

export const _getGtmScript = ({ gtmId, auth, preview }: TagManagerArgs) => {
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
}

// https://developers.google.com/tag-platform/devguides/privacy#turn_off_google_analytics
const GA_DISABLE_KEY = `ga-disable-${GOOGLE_ANALYTICS_MEASUREMENT_ID}`
const GTM_DISABLE_TRIGGER_COOKIE_NAME = 'google-analytics-opt-out'

// Injected GTM script singleton
let gtmScriptRef: HTMLScriptElement | null = null

const TagManager = {
  isEnabled: () => {
    // @ts-expect-error - Element implicitly has an 'any' type because index expression is not of type 'number'.
    return Cookies.get(GTM_DISABLE_TRIGGER_COOKIE_NAME) === undefined && window[GA_DISABLE_KEY] === false
  },
  isMounted: () => {
    return GA_DISABLE_KEY in window && gtmScriptRef
  },
  initialize: (args: TagManagerArgs) => {
    if (TagManager.isEnabled()) {
      return
    }

    // Enable GA
    // @ts-expect-error - Element implicitly has an 'any' type because index expression is not of type 'number'.
    window[GA_DISABLE_KEY] = false

    // Enable GTM triggers
    Cookies.remove(GTM_DISABLE_TRIGGER_COOKIE_NAME, { path: '/' })

    if (gtmScriptRef) {
      return
    }

    // Initialize dataLayer (with configuration)
    window[DATA_LAYER_NAME] = args.dataLayer ? [args.dataLayer] : []

    gtmScriptRef = _getGtmScript(args)

    // Initialize GTM. This pushes the default dataLayer event:
    // { "gtm.start": new Date().getTime(), event: "gtm.js" }
    document.head.insertBefore(gtmScriptRef, document.head.childNodes[0])
  },
  dataLayer: (dataLayer: DataLayer) => {
    if (!TagManager.isEnabled() || !TagManager.isMounted()) {
      return
    }

    window[DATA_LAYER_NAME].push(dataLayer)

    if (!IS_PRODUCTION) {
      console.info('[GTM] -', dataLayer)
    }
  },
  disable: () => {
    if (!TagManager.isMounted()) {
      const GTM_COOKIE_LIST = ['_ga', '_gat', '_gid']

      GTM_COOKIE_LIST.forEach((cookie) => {
        Cookies.remove(cookie, {
          path: '/',
          domain: `.${location.host.split('.').slice(-2).join('.')}`,
        })
      })
    }

    if (!TagManager.isEnabled()) {
      return
    }

    // Disable GA
    // @ts-expect-error - Element implicitly has an 'any' type because index expression is not of type 'number'.
    window[GA_DISABLE_KEY] = true

    // Disable GTM triggers
    Cookies.set(GTM_DISABLE_TRIGGER_COOKIE_NAME, 'true', {
      expires: Number.MAX_SAFE_INTEGER,
      path: '/',
    })
  },
}

export default TagManager
