import { trackEvent, WALLET_EVENTS } from '@/services/analytics'
import { getTxDetails } from '@/services/transactions'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { isSwapTxInfo } from '@/utils/transaction-guards'
import { useEffect } from 'react'
import useChainId from './useChainId'

const events = {
  [TxEvent.SIGNED]: WALLET_EVENTS.OFFCHAIN_SIGNATURE,
  [TxEvent.PROCESSING]: WALLET_EVENTS.ONCHAIN_INTERACTION,
  [TxEvent.PROCESSING_MODULE]: WALLET_EVENTS.ONCHAIN_INTERACTION,
  [TxEvent.RELAYING]: WALLET_EVENTS.ONCHAIN_INTERACTION,
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
        let transaction_id

        if (id) {
          try {
            const txDetails = await getTxDetails(chainId, id)
            origin = txDetails.safeAppInfo?.url || ''
            transaction_id = isSwapTxInfo(txDetails.txInfo) ? txDetails.txInfo.uid : undefined
          } catch {}
        }

        trackEvent({
          ...analyticsEvent,
          label: origin,
          transaction_id,
        })
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [chainId])
}
