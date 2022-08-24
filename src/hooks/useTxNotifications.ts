import { useEffect } from 'react'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { AppRoutes } from '@/config/routes'
import useSafeInfo from './useSafeInfo'
import { useCurrentChain } from './useChains'

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
  const chain = useCurrentChain()
  const { safeAddress } = useSafeInfo()

  const entries = Object.entries(TxNotifications) as [TxEvent, string][]

  useEffect(() => {
    const unsubFns = entries.map(([event, baseMessage]) =>
      txSubscribe(event, (detail) => {
        const isError = 'error' in detail
        const isSuccess = event === TxEvent.SUCCESS || event === TxEvent.PROPOSED
        const customMessage = 'message' in detail ? detail.message : undefined
        const message = isError ? `${baseMessage} ${detail.error.message.slice(0, 300)}` : customMessage || baseMessage

        const txId = 'txId' in detail ? detail.txId : undefined
        const batchId = 'batchId' in detail ? detail.batchId : undefined

        const shouldShowLink = event !== TxEvent.EXECUTING && txId

        dispatch(
          showNotification({
            message,
            groupKey: batchId || txId || '',
            variant: isError ? Variant.ERROR : isSuccess ? Variant.SUCCESS : Variant.INFO,
            ...(shouldShowLink && {
              link: {
                href: `${AppRoutes.safe.transactions.tx}?id=${txId}&safe=${chain?.shortName}:${safeAddress}`,
                title: 'View transaction',
              },
            }),
          }),
        )
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [dispatch, safeAddress, chain?.shortName])
}

export default useTxNotifications
