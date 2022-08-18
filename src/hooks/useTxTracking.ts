import { trackEvent } from '@/services/analytics/analytics'
import { WALLET_EVENTS } from '@/services/analytics/events/wallet'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { useEffect } from 'react'

const events = {
  [TxEvent.SIGNED]: WALLET_EVENTS.OFF_CHAIN_SIGNATURE,
  [TxEvent.MINING]: WALLET_EVENTS.ON_CHAIN_INTERACTION,
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
