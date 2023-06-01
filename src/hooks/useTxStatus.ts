import { useEffect, useState } from 'react'
import { useAppDispatch } from '@/store'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { useCurrentChain } from './useChains'
import useSafeAddress from './useSafeAddress'

const TxNotifications = {
  [TxEvent.PROCESSING]: 'Your transaction is being processed.',
  [TxEvent.PROCESSED]: 'Your transaction was successfully processed and is now being indexed.',
  [TxEvent.SUCCESS]: 'Your transaction was successfully executed.',
}

const useTxStatus = () => {
  const dispatch = useAppDispatch()
  const chain = useCurrentChain()
  const safeAddress = useSafeAddress()
  const [status, setStatus] = useState<TxEvent>(TxEvent.PROCESSING)

  useEffect(() => {
    if (!chain) return

    const entries = Object.entries(TxNotifications) as [keyof typeof TxNotifications, string][]

    const unsubFns = entries.map(([event]) =>
      txSubscribe(event, () => {
        setStatus(event)
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [dispatch, safeAddress, chain])

  return { status }
}

export default useTxStatus
