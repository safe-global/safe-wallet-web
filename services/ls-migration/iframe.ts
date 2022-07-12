/**
 * Create an iframe element with a given URL
 */
export const createIframe = (src: string): HTMLIFrameElement => {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = src
  document.body.appendChild(iframe)
  return iframe
}

/**
 * Send a message to the iframe
 */
export const sendReadyMessage = (iframe: HTMLIFrameElement, targetOrigin: string) => {
  iframe.addEventListener(
    'load',
    () => {
      iframe.contentWindow?.postMessage('ready', targetOrigin)
    },
    { once: true },
  )
}

/**
 * Subscribe to window messages
 */
export const receiveMessage = (callback: (message: any) => void, trustedOrigin: string) => {
  const onMessage = (event: MessageEvent) => {
    if (event.origin !== trustedOrigin) return
    callback(event.data)
  }

  window.addEventListener('message', onMessage)

  return () => window.removeEventListener('message', onMessage)
}
