import { useState, useEffect } from 'react'

import { getClipboard, isClipboardGranted } from '@/utils/clipboard'
import { Errors, logError } from '../exceptions'

export const useWalletConnectClipboardUri = (): [string, (data: string) => Promise<void>] => {
  const [state, setState] = useState('')

  useEffect(() => {
    if (!navigator || !window) {
      return
    }

    const setClipboard = async () => {
      // Errors handled in the clipboard utils
      const isGranted = await isClipboardGranted()
      if (!isGranted) {
        return
      }

      const clipboard = await getClipboard()

      if (clipboard.startsWith('wc:')) {
        setState(clipboard)
      }
    }

    setClipboard()

    // Update clipboard when returning to Safe
    window.addEventListener('focus', setClipboard)
    return () => {
      window.removeEventListener('focus', setClipboard)
    }
  }, [])

  const setClipboard = async (data: string) => {
    await navigator.clipboard
      .writeText(data)
      .then(() => {
        setState(data)
      })
      .catch((e) => {
        logError(Errors._709, e)
      })
  }

  return [state, setClipboard]
}
