import { useEffect } from 'react'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { AppRoutes } from '@/config/routes'
import useSafeInfo from './useSafeInfo'
import { useCurrentChain } from './useChains'

const TxNotifications = {
  [TxEvent.SIGN_FAILED]: 'Signature failed. Please try again.',
  [TxEvent.PROPOSED]: 'Your transaction was successfully proposed.',
  [TxEvent.PROPOSE_FAILED]: 'Failed proposing the transaction. Please try again.',
  [TxEvent.SIGNATURE_PROPOSED]: 'You successfully signed the transaction.',
  [TxEvent.SIGNATURE_PROPOSE_FAILED]: 'Failed to send the signature. Please try again.',
  [TxEvent.EXECUTING]: 'Please confirm the execution in your wallet.',
  [TxEvent.PROCESSING]: 'Your transaction is being processed.',
  [TxEvent.PROCESSING_MODULE]:
    'Your transaction has been submitted and will appear in the interface only after it has been successfully processed and indexed.',
  [TxEvent.AWAITING_ON_CHAIN_SIGNATURE]: 'An on-chain signature request was submitted.',
  [TxEvent.PROCESSED]: 'Your transaction was successfully processed and is now being indexed.',
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

  useEffect(() => {
    const entries = Object.entries(TxNotifications) as [keyof typeof TxNotifications, string][]

    const unsubFns = entries.map(([event, baseMessage]) =>
      txSubscribe(event, (detail) => {
        const isError = 'error' in detail
        const isSuccess = event === TxEvent.SUCCESS || event === TxEvent.PROPOSED
        const message = isError ? `${baseMessage} ${detail.error.message.slice(0, 300)}` : baseMessage

        const txId = 'txId' in detail ? detail.txId : undefined
        const groupKey = 'groupKey' in detail && detail.groupKey ? detail.groupKey : txId || ''

        const shouldShowLink = event !== TxEvent.EXECUTING && txId

        dispatch(
          showNotification({
            message,
            groupKey,
            variant: isError ? Variant.ERROR : isSuccess ? Variant.SUCCESS : Variant.INFO,
            ...(shouldShowLink && {
              link: {
                href: `${AppRoutes.transactions.tx}?id=${txId}&safe=${chain?.shortName}:${safeAddress}`,
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
