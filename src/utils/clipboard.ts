import { logError, Errors } from '@/services/exceptions'

export const isClipboardGranted = async (): Promise<boolean> => {
  let isGranted = false

  try {
    // @ts-expect-error navigator permissions types don't include clipboard
    const permission = await navigator.permissions.query({ name: 'clipboard-read' })
    isGranted = permission.state === 'granted'
  } catch (e) {
    logError(Errors._707, e)
  }

  return isGranted
}

export const getClipboard = async (): Promise<string> => {
  // readText is not supported by Firefox
  // @see https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText#browser_compatibility
  const isFirefox = navigator.userAgent.includes('Firefox')
  if (isFirefox) {
    return ''
  }

  let clipboard = ''

  try {
    clipboard = await navigator.clipboard.readText()
  } catch (e) {
    logError(Errors._708, e)
  }

  return clipboard
}
