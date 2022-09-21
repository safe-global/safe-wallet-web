import { trackEvent, WALLET_EVENTS } from '@/services/analytics'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { useEffect } from 'react'

const events = {
  [TxEvent.SIGNED]: WALLET_EVENTS.OFF_CHAIN_SIGNATURE,
  [TxEvent.PROCESSING]: WALLET_EVENTS.ON_CHAIN_INTERACTION,
}

export const useTxTracking = (): void => {
  useEffect(() => {
    const unsubFns = Object.entries(events).map(([txEvent, analyticsEvent]) =>
      txSubscribe(txEvent as TxEvent, () => {
        trackEvent(analyticsEvent)
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [])
}
