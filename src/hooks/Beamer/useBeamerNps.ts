import { useEffect } from 'react'

import { BEAMER_ID } from '@/config/constants'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'

const COOKIE_NAME = `_BEAMER_NPS_LAST_SHOWN_${BEAMER_ID}`

export const useBeamerNps = (): void => {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Beamer) {
      return
    }

    const unsubscribe = txSubscribe(TxEvent.PROPOSED, () => {
      // Beamer advise using their '/nps/check' endpoint to see if the NPS should be shown
      // As we need to check this more than the request limit, we instead check the cookie
      // @see https://www.getbeamer.com/api
      const lastShown = window.Beamer.getCookie(COOKIE_NAME)

      // We "force" the NPS banner as we have it globally disabled in Beamer to prevent it
      // randomly showing on pages that we don't want it to
      // Note: this is not documented but confirmed by Beamer support
      if (!lastShown) {
        window.Beamer.forceShowNPS()
      }
    })

    return unsubscribe
  }, [])
}
