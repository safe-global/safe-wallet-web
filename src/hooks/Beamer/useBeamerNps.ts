import { useEffect } from 'react'

import { BEAMER_ID } from '@/config/constants'

const LS_KEY = `_BEAMER_NPS_LAST_SHOWN_${BEAMER_ID}`

export const useBeamerNps = (): void => {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Beamer) {
      return
    }

    const lastShown = window.Beamer.getCookie(LS_KEY)

    if (!lastShown) {
      window.Beamer.forceShowNPS()
    }
  }, [])
}
