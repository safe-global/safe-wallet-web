import { useEffect } from 'react'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'

const TxNotifications: Partial<Record<TxEvent, string>> = {
  [TxEvent.SIGN_FAILED]: 'Signature failed. Please try again.',
  [TxEvent.PROPOSED]: 'Your transaction was successfully proposed.',
  [TxEvent.PROPOSE_FAILED]: 'Failed proposing the transaction. Please try again.',
  [TxEvent.SIGNATURE_PROPOSED]: 'You successfully signed the transaction.',
  [TxEvent.SIGNATURE_PROPOSE_FAILED]: 'Failed to send the signature. Please try again.',
  [TxEvent.EXECUTING]: 'Please confirm the execution in your wallet.',
  [TxEvent.MINING]: 'Your transaction is being mined.',
  [TxEvent.MINED]: 'Your transaction was successfully mined and is now being indexed.',
  [TxEvent.REVERTED]: 'Transaction reverted. Please check your gas settings.',
  [TxEvent.SUCCESS]: 'Your transaction was successfully executed.',
  [TxEvent.FAILED]: 'Your transaction was unsuccessful.',
}

enum Variant {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
}

const useTxNotifications = (): void => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsubFns = Object.entries(TxNotifications).map(([event, baseMessage]) =>
      txSubscribe(event as TxEvent, (detail) => {
        const isError = 'error' in detail
        const isSuccess = event === TxEvent.SUCCESS || event === TxEvent.PROPOSED
        const message = isError ? `${baseMessage} ${detail.error.message.slice(0, 300)}` : baseMessage
        const txId = 'txId' in detail && detail.txId
        const txHash = 'txHash' in detail && detail.txHash

        dispatch(
          showNotification({
            message,
            groupKey: txHash || txId || '',
            variant: isError ? Variant.ERROR : isSuccess ? Variant.SUCCESS : Variant.INFO,
          }),
        )
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [dispatch])
}

export default useTxNotifications
