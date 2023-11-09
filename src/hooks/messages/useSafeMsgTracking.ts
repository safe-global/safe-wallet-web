import { useEffect } from 'react'

import { trackEvent, WALLET_EVENTS } from '@/services/analytics'
import { SafeMsgEvent, safeMsgSubscribe } from '@/services/safe-messages/safeMsgEvents'
import { TX_EVENTS, TX_TYPES } from '@/services/analytics/events/transactions'

const safeMsgEvents = {
  [SafeMsgEvent.PROPOSE]: WALLET_EVENTS.SIGN_MESSAGE,
  [SafeMsgEvent.CONFIRM_PROPOSE]: WALLET_EVENTS.CONFIRM_MESSAGE,
}

export const useSafeMsgTracking = (): void => {
  useEffect(() => {
    const unsubFns = Object.entries(safeMsgEvents).map(([safeMsgEvent, analyticsEvent]) =>
      safeMsgSubscribe(safeMsgEvent as SafeMsgEvent, () => {
        trackEvent(analyticsEvent)

        if (analyticsEvent === WALLET_EVENTS.SIGN_MESSAGE) {
          trackEvent({ ...TX_EVENTS.CREATE, label: TX_TYPES.message })
        }
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [])
}
