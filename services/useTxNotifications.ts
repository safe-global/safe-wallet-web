import { useEffect } from 'react'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'
import { TxEvent, txSubscribe } from './tx/txEvents'

const TxNotifications: Record<TxEvent, string> = {
  [TxEvent.CREATED]: '',
  [TxEvent.SIGNED]: '',
  [TxEvent.MINING]: 'Your transaction is mining',
  [TxEvent.EXECUTING]: 'Please confirm the execution in your wallet',
  [TxEvent.SIGN_FAILED]: 'Signature failed. Please try again.',
  [TxEvent.PROPOSE_FAILED]: 'Propose failed. Please try again.',
  [TxEvent.MINED]: 'Your transaction was succesfully mined! It is now being indexed by our transaction service.',
  [TxEvent.FAILED]: 'Your transaction was unsuccessful.',
  [TxEvent.REVERTED]: 'Please check your gas settings.',
  [TxEvent.SUCCESS]:
    'Your transaction was successfully indexed! It is now viewable in the historical transaction list.',
  [TxEvent.PROPOSED]: 'Your transaction was successfully proposed.',
}

enum Variant {
  SUCCESS = 'success',
  ERROR = 'error',
}

const useTxNotifications = (): void => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsubFns = Object.values(TxEvent)
      .map((event) => {
        const baseMessage = TxNotifications[event]
        if (!baseMessage) return

        return txSubscribe(event, (detail) => {
          const isError = 'error' in detail
          const message = isError ? `${baseMessage} ${detail.error.message}` : baseMessage

          dispatch(
            showNotification({
              message,
              options: {
                // For the key, use the entire serialized tx
                // This will stack notifications if multiple txs are sent at once
                key: 'tx' in detail ? JSON.stringify(detail.tx) : '',
                variant: isError ? Variant.ERROR : Variant.SUCCESS,
              },
            }),
          )
        })
      })
      .filter(Boolean)

    return () => {
      unsubFns.forEach((unsub) => unsub?.())
    }
  }, [dispatch])
}

export default useTxNotifications
