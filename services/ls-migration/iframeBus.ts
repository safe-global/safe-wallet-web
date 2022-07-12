import { IS_PRODUCTION } from '@/config/constants'

const IFRAME_HOST = IS_PRODUCTION ? 'https://gnosis-safe.io' : 'https://safe-team.dev.gnosisdev.com'
const IFRAME_PATH = '/migrate.html'

/**
 * Create an iframe element with a given URL
 */
const createIframe = (src: string): HTMLIFrameElement => {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = src
  document.body.appendChild(iframe)
  return iframe
}

/**
 * Send a message to the iframe
 */
const sendMessage = (iframe: HTMLIFrameElement, message: string) => {
  iframe.contentWindow?.postMessage(message, IFRAME_HOST)
}

/**
 * Subscribe to the message from iframe
 */
const receiveMessage = (callback: (message: string) => void) => {
  const onMessage = (event: MessageEvent) => {
    if (event.origin !== IFRAME_HOST) return
    callback(event.data)
  }

  window.addEventListener('message', onMessage)

  return () => window.removeEventListener('message', onMessage)
}

/**
 * Create and an iframe and subscribe to the message from it
 */
const createIframeBus = (onMessage: (message: string) => void) => {
  // Create iframe
  const iframe = createIframe(`${IFRAME_HOST}${IFRAME_PATH}`)

  // Send a message to the iframe so that it knows where to respond
  sendMessage(iframe, 'ready')

  // Subscribe to the message from iframe
  const unsub = receiveMessage((message) => {
    iframe.remove()
    unsub()
    onMessage(message)
  })
}

export default createIframeBus
