import { IS_PRODUCTION } from '@/config/constants'
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

let gtmScriptRef: HTMLScriptElement | null = null

const TagManager = {
  initialize: (args: TagManagerArgs) => {
    if (gtmScriptRef) {
      return
    }

    // Push configuration to dataLayer
    if (args.dataLayer) {
      window[DATA_LAYER_NAME] = []
      window[DATA_LAYER_NAME].push(args.dataLayer)
    }

    gtmScriptRef = _getGtmScript(args)

    // Initialize GTM. This pushes the default dataLayer event:
    // { "gtm.start": new Date().getTime(), event: "gtm.js" }
    document.head.insertBefore(gtmScriptRef, document.head.childNodes[0])
  },
  dataLayer: (dataLayer: DataLayer) => {
    // Push to dataLayer if mounted
    if (!gtmScriptRef || !window[DATA_LAYER_NAME]) {
      return
    }

    if (!IS_PRODUCTION) {
      console.info('[GTM] -', dataLayer)
    }

    window[DATA_LAYER_NAME].push(dataLayer)
  },
  destroy: () => {
    if (!gtmScriptRef) {
      return
    }

    const GTM_SCRIPT = 'https://www.googletagmanager.com'
    const GTM_COOKIE_LIST = ['_ga', '_gat', '_gid']

    // Unmount GTM script
    gtmScriptRef.remove()
    gtmScriptRef = null

    // Remove script(s) (gtmScriptRef inserts a script before itself to the DOM)
    const scripts = document.querySelectorAll(`[src^="${GTM_SCRIPT}"]`)
    scripts?.forEach((script) => {
      script.remove()
    })

    // Empty dataLayer
    delete window[DATA_LAYER_NAME]

    // Remove cookies
    const path = '/'
    const domain = `.${location.host.split('.').slice(-2).join('.')}`
    GTM_COOKIE_LIST.forEach((cookie) => {
      Cookies.remove(cookie, { path, domain })
    })
  },
}

export default TagManager
