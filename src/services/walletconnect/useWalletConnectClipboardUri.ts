import { useState, useEffect } from 'react'
import type { SetStateAction, Dispatch } from 'react'

import { getClipboard, isClipboardGranted } from '@/utils/clipboard'

export const useWalletConnectClipboardUri = (): [string, Dispatch<SetStateAction<string>>] => {
  const [state, setState] = useState('')

  useEffect(() => {
    if (!navigator || !window) {
      return
    }

    // Errors handled in the clipboard utils
    const setClipboard = () => {
      isClipboardGranted().then((isGranted) => {
        if (isGranted) {
          getClipboard().then(setState)
        }
      })
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
