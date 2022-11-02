import Cookies from 'js-cookie'

// Based on https://github.com/alinemorelli/react-gtm

type DataLayer = Record<string, unknown>

export type TagManagerArgs = {
  /**
   * GTM id, must be something like GTM-000000.
   */
  gtmId: string
  /**
   * Used to set environments.
   */
  auth: string
  /**
   * Used to set environments, something like env-00.
   */
  preview: string
  /**
   * Object that contains all of the information that you want to pass to Google Tag Manager.
   */
  dataLayer?: DataLayer
}

const DATA_LAYER_NAME = 'dataLayer'

// GTM script tag singleton
let scriptRef: HTMLScriptElement | null = null

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

// Data layer scripts

const TagManager = {
  initialize: ({ dataLayer, ...args }: TagManagerArgs) => {
    if (dataLayer) {
      TagManager.dataLayer(dataLayer)
    }

    scriptRef = _getGtmScript(args)
    document.head.insertBefore(scriptRef, document.head.childNodes[0])
  },
  destroy: () => {
    const GOOGLE_ANALYTICS_COOKIE_LIST = ['_ga', '_gat', '_gid']

    // Remove GTM script
    scriptRef?.remove()
    scriptRef = null

    delete window[DATA_LAYER_NAME]

    // Remove cookies
    const path = '/'
    const domain = `.${location.host.split('.').slice(-2).join('.')}`

    GOOGLE_ANALYTICS_COOKIE_LIST.forEach((cookie) => {
      Cookies.remove(cookie, { path, domain })
    })
  },
  dataLayer: (dataLayer: DataLayer) => {
    window[DATA_LAYER_NAME] ||= []

    return window[DATA_LAYER_NAME].push(dataLayer)
  },
}

export default TagManager
