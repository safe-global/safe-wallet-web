import { trackEvent, WALLET_EVENTS } from '@/services/analytics'
import { TX_EVENTS } from '@/services/analytics/events/transactions'
import { RecoveryEvent } from '@/services/recovery/recoveryEvents'
import { getTxDetails } from '@/services/tx/txDetails'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { useEffect } from 'react'
import useChainId from './useChainId'

const events = {
  [TxEvent.SIGNATURE_PROPOSED]: TX_EVENTS.CONFIRM,
  [TxEvent.SIGNED]: WALLET_EVENTS.OFFCHAIN_SIGNATURE,
  [TxEvent.PROCESSING]: WALLET_EVENTS.ONCHAIN_INTERACTION,
  [TxEvent.PROCESSING_MODULE]: WALLET_EVENTS.ONCHAIN_INTERACTION,
  [TxEvent.RELAYING]: WALLET_EVENTS.ONCHAIN_INTERACTION,
  [RecoveryEvent.PROCESSING]: WALLET_EVENTS.ONCHAIN_INTERACTION,
}

export const useTxTracking = (): void => {
  const chainId = useChainId()

  useEffect(() => {
    const unsubFns = Object.entries(events).map(([txEvent, analyticsEvent]) =>
      txSubscribe(txEvent as TxEvent, async (detail) => {
        const txId = 'txId' in detail ? detail.txId : undefined
        const txHash = 'txHash' in detail ? detail.txHash : undefined
        const id = txId || txHash

        let origin = ''
        if (id) {
          try {
            const txDetails = await getTxDetails(chainId, id)
            origin = txDetails.safeAppInfo?.url || ''
          } catch {}
        }

        trackEvent({
          ...analyticsEvent,
          label: origin,
        })
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [chainId])
}
