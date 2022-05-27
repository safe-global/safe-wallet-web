import { useEffect } from 'react'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'
import { TxEvent, txSubscribe } from './tx/txEvents'

const TxNotifications: Partial<Record<TxEvent, string>> = {
  [TxEvent.SIGN_FAILED]: 'Signature failed. Please try again.',
  [TxEvent.PROPOSED]: 'Your transaction was successfully proposed.',
  [TxEvent.PROPOSE_FAILED]: 'Proposal failed. Please try again.',
  [TxEvent.EXECUTING]: 'Please confirm the execution in your wallet',
  [TxEvent.MINING]: 'Your transaction is mining',
  [TxEvent.MINED]: 'Your transaction was succesfully mined! It is now being indexed by our transaction service.',
  [TxEvent.REVERTED]: 'Please check your gas settings.',
  [TxEvent.SUCCESS]:
    'Your transaction was successfully indexed! It is now viewable in the historical transaction list.',
  [TxEvent.FAILED]: 'Your transaction was unsuccessful.',
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
