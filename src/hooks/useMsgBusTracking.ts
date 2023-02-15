import { trackEvent, WALLET_EVENTS, MESSAGE_WALLET_EVENTS } from '@/services/analytics'
import { SafeMsgEvent, safeMsgSubscribe } from '@/services/safe-messages/safeMsgEvents'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { useEffect } from 'react'

const txEvents = {
  [TxEvent.SIGNED]: WALLET_EVENTS.OFF_CHAIN_SIGNATURE,
  [TxEvent.PROCESSING]: WALLET_EVENTS.ON_CHAIN_INTERACTION,
}

const safeMsgEvents = {
  [SafeMsgEvent.PROPOSE]: MESSAGE_WALLET_EVENTS.SIGN_MESSAGE,
  [SafeMsgEvent.CONFIRM_PROPOSE]: MESSAGE_WALLET_EVENTS.CONFIRM_MESSAGE,
}

export const useMsgBusTracking = (): void => {
  useEffect(() => {
    const unsubFns = Object.entries(txEvents).map(([txEvent, analyticsEvent]) =>
      txSubscribe(txEvent as TxEvent, () => {
        trackEvent(analyticsEvent)
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [])

  useEffect(() => {
    const unsubFns = Object.entries(safeMsgEvents).map(([safeMsgEvent, analyticsEvent]) =>
      safeMsgSubscribe(safeMsgEvent as SafeMsgEvent, () => {
        trackEvent(analyticsEvent)
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [])
}
