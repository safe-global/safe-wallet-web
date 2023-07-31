import Cookies from 'js-cookie'

import { IS_PRODUCTION } from '@/config/constants'

type DataLayer = Record<string, unknown>

export type TagManagerArgs = {
  // GTM id, e.g. GTM-000000
  gtmId: string
  // GTM authentication key
  auth: string
  // GTM environment, e.g. env-00.
  preview: string
  // Object that contains all of the information that you want to pass to GTM
  dataLayer?: DataLayer
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
  isInitialized: () => {
    const GTM_SCRIPT = 'https://www.googletagmanager.com/gtm.js'

    return !!document.querySelector(`[src^="${GTM_SCRIPT}"]`)
  },
  initialize: (args: TagManagerArgs) => {
    if (TagManager.isInitialized()) {
      return
    }

    // Initialize dataLayer (with configuration)
    window[DATA_LAYER_NAME] = args.dataLayer ? [args.dataLayer] : []

    const script = TagManager._getScript(args)

    // Initialize GTM. This pushes the default dataLayer event:
    // { "gtm.start": new Date().getTime(), event: "gtm.js" }
    document.head.insertBefore(script, document.head.childNodes[0])
  },
  dataLayer: (dataLayer: DataLayer) => {
    if (!TagManager.isInitialized()) {
      return
    }

    window[DATA_LAYER_NAME].push(dataLayer)

    if (!IS_PRODUCTION) {
      console.info('[GTM] -', dataLayer)
    }
  },
  disable: () => {
    if (!TagManager.isInitialized()) {
      return
    }

    const GTM_COOKIE_LIST = ['_ga', '_gat', '_gid']

    GTM_COOKIE_LIST.forEach((cookie) => {
      Cookies.remove(cookie, {
        path: '/',
        domain: `.${location.host.split('.').slice(-2).join('.')}`,
      })
    })

    // Injected script will remain in memory until new session
    location.reload()
  },
}

export default TagManager
