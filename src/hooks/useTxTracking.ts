import { trackEvent, WALLET_EVENTS } from '@/services/analytics'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { useEffect } from 'react'
import useWallet from './wallets/useWallet'

const events = {
  [TxEvent.SIGNED]: WALLET_EVENTS.OFF_CHAIN_SIGNATURE,
  [TxEvent.PROCESSING]: WALLET_EVENTS.ON_CHAIN_INTERACTION,
  [TxEvent.RELAYING]: WALLET_EVENTS.RELAYED_EXECUTION,
}

export const useTxTracking = (): void => {
  const wallet = useWallet()
  useEffect(() => {
    const unsubFns = Object.entries(events).map(([txEvent, analyticsEvent]) =>
      txSubscribe(txEvent as TxEvent, () => {
        trackEvent({ ...analyticsEvent, label: wallet?.label })
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [wallet?.label])
}
