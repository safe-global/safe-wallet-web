import { useState, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { getClipboard, isClipboardGranted } from '@/utils/clipboard'
import { isPairingUri } from './utils'

const stalePairingUris: Array<string> = []

export const useWalletConnectClipboardUri = (): [string, Dispatch<SetStateAction<string>>] => {
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

      // Ensure valid pairing URIs
      if (isPairingUri(clipboard) && !stalePairingUris.includes(clipboard)) {
        stalePairingUris.push(clipboard)
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

  return [state, setState]
}
