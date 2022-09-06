// Based on https://github.com/alinemorelli/react-gtm

type DataLayer = Record<string, unknown>

export type TagManagerArgs = {
  /**
   * GTM id, must be something like GTM-000000.
   */
  gtmId: string
  /**
   * Additional events such as 'gtm.start': new Date().getTime(),event:'gtm.js'.
   */
  events?: Record<string, unknown> | undefined
  /**
   * Used to set environments.
   */
  auth?: string | undefined
  /**
   * Used to set environments, something like env-00.
   */
  preview?: string | undefined
  /**
   * Object that contains all of the information that you want to pass to Google Tag Manager.
   */
  dataLayer?: DataLayer | undefined
}

export const DATA_LAYER_NAME = 'dataLayer'

export const _getRequiredGtmArgs = ({
  gtmId,
  events = {},
  dataLayer = undefined,
  auth = '',
  preview = '',
}: TagManagerArgs) => {
  return {
    gtmId,
    events,
    dataLayer,
    auth: auth ? `&gtm_auth=${auth}` : '',
    preview: preview ? `&gtm_preview=${preview}` : '',
  }
}

// Initialization scripts

export const _getGtmScript = (args: TagManagerArgs) => {
  const { gtmId, events, auth, preview } = _getRequiredGtmArgs(args)

  const script = document.createElement('script')

  const gtmScript = `
      (function(w,d,s,l,i){w[l]=w[l]||[];
        w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js', ${JSON.stringify(events).slice(1, -1)}});
        var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
        j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl+'${auth}${preview}&gtm_cookies_win=x';
        f.parentNode.insertBefore(j,f);
      })(window,document,'script','${DATA_LAYER_NAME}','${gtmId}');`

  script.innerHTML = gtmScript

  return script
}

export const _getGtmNoScript = (args: TagManagerArgs) => {
  const { gtmId, auth, preview } = _getRequiredGtmArgs(args)

  const noscript = document.createElement('noscript')

  const gtmIframe = `
      <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}${auth}${preview}&gtm_cookies_win=x"
        height="0" width="0" style="display:none;visibility:hidden" id="tag-manager"></iframe>`

  noscript.innerHTML = gtmIframe

  return noscript
}

// Data layer scripts

export const _getGtmDataLayerScript = (dataLayer: DataLayer) => {
  const script = document.createElement('script')

  const gtmDataLayerScript = `
      window.${DATA_LAYER_NAME} = window.${DATA_LAYER_NAME} || [];
      window.${DATA_LAYER_NAME}.push(${JSON.stringify(dataLayer)})`

  script.innerHTML = gtmDataLayerScript

  return script
}

const TagManager = {
  initialize: (args: TagManagerArgs) => {
    const { dataLayer } = _getRequiredGtmArgs(args)

    if (dataLayer) {
      document.createElement('script').innerHTML = JSON.stringify(dataLayer)
    }

    const gtmScript = _getGtmScript(args)
    document.head.insertBefore(gtmScript, document.head.childNodes[0])

    const gtmNoScript = _getGtmNoScript(args)
    document.body.insertBefore(gtmNoScript, document.body.childNodes[0])
  },
  dataLayer: (dataLayer: DataLayer) => {
    if (window[DATA_LAYER_NAME]) {
      return window[DATA_LAYER_NAME].push(dataLayer)
    }

    const gtmDataLayerScript = _getGtmDataLayerScript(dataLayer)
    document.head.insertBefore(gtmDataLayerScript, document.head.childNodes[0])
  },
}

export default TagManager
