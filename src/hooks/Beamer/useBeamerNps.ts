import { useEffect } from 'react'

import { txSubscribe } from '@/services/tx/txEvents'
import { useAppSelector } from '@/store'
import { selectCookies, CookieType } from '@/store/cookiesSlice'
import { shouldShowBeamerNps } from '@/services/beamer'
import { successEvents } from '@/hooks/useTxNotifications'

export const useBeamerNps = (): void => {
  const cookies = useAppSelector(selectCookies)
  const isBeamerEnabled = cookies[CookieType.UPDATES]

  useEffect(() => {
    if (typeof window === 'undefined' || !isBeamerEnabled) {
      return
    }

    const unsubFns = successEvents.map((event) => {
      return txSubscribe(event, () => {
        // Cannot check at the top of effect as Beamer may not have loaded yet
        if (shouldShowBeamerNps()) {
          // We "force" the NPS banner as we have it globally disabled in Beamer to prevent it
          // randomly showing on pages that we don't want it to
          // Note: this is not documented but confirmed by Beamer support
          window.Beamer?.forceShowNPS()
        }

        unsubFns.forEach((unsub) => unsub())
      })
    })

    return unsubFns.forEach((unsub) => unsub())
  }, [isBeamerEnabled])
}
