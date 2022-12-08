import { useEffect, useMemo } from 'react'
import { capitalize } from '@/utils/formatters'
import { selectNotifications, showNotification } from '@/store/notificationsSlice'
import { useAppDispatch, useAppSelector } from '@/store'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { AppRoutes } from '@/config/routes'
import useSafeInfo from './useSafeInfo'
import { useCurrentChain } from './useChains'
import useTxQueue from './useTxQueue'
import { isSignableBy, isTransactionListItem } from '@/utils/transaction-guards'
import { TransactionStatus } from '@safe-global/safe-gateway-typescript-sdk'
import { selectPendingTxs } from '@/store/pendingTxsSlice'
import useIsGranted from './useIsGranted'
import useWallet from './wallets/useWallet'

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

// Format the error message
export const formatError = (error: Error & { reason?: string }): string => {
  let { reason } = error
  if (!reason) return ''
  if (!reason.endsWith('.')) reason += '.'
  return capitalize(reason)
}

const useTxNotifications = (): void => {
  const dispatch = useAppDispatch()
  const chain = useCurrentChain()
  const { safeAddress } = useSafeInfo()

  /**
   * Show notifications of a transaction's lifecycle
   */

  useEffect(() => {
    const entries = Object.entries(TxNotifications) as [keyof typeof TxNotifications, string][]

    const unsubFns = entries.map(([event, baseMessage]) =>
      txSubscribe(event, (detail) => {
        const isError = 'error' in detail
        const isSuccess = event === TxEvent.SUCCESS || event === TxEvent.PROPOSED
        const message = isError ? `${baseMessage} ${formatError(detail.error)}` : baseMessage

        const txId = 'txId' in detail ? detail.txId : undefined
        const groupKey = 'groupKey' in detail && detail.groupKey ? detail.groupKey : txId || ''

        const shouldShowLink = event !== TxEvent.EXECUTING && txId

        dispatch(
          showNotification({
            message,
            detailedMessage: isError ? detail.error.message : undefined,
            groupKey,
            variant: isError ? Variant.ERROR : isSuccess ? Variant.SUCCESS : Variant.INFO,
            ...(shouldShowLink && {
              link: {
                href: {
                  pathname: AppRoutes.transactions.tx,
                  query: { id: txId, safe: `${chain?.shortName}:${safeAddress}` },
                },
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

  /**
   * If there's at least one transaction awaiting confirmations, show a notification for it
   */

  const { page } = useTxQueue()
  const isGranted = useIsGranted()
  const pendingTxs = useAppSelector(selectPendingTxs)
  const notifications = useAppSelector(selectNotifications)
  const wallet = useWallet()

  const txsAwaitingConfirmation = useMemo(() => {
    if (!page?.results) {
      return []
    }

    return page.results.filter(isTransactionListItem).filter(({ transaction }) => {
      const isAwaitingConfirmations = transaction.txStatus === TransactionStatus.AWAITING_CONFIRMATIONS
      const isPending = !!pendingTxs[transaction.id]
      const canSign = isSignableBy(transaction, wallet?.address || '')
      return isAwaitingConfirmations && !isPending && canSign
    })
  }, [page?.results, pendingTxs, wallet?.address])

  useEffect(() => {
    if (!isGranted || txsAwaitingConfirmation.length === 0) {
      return
    }

    const txId = txsAwaitingConfirmation[0].transaction.id
    const hasNotified = notifications.some(({ groupKey }) => groupKey === txId)

    if (!hasNotified) {
      dispatch(
        showNotification({
          variant: 'info',
          message: 'A transaction requires your confirmation.',
          link: {
            href: `${AppRoutes.transactions.tx}?id=${txId}&safe=${chain?.shortName}:${safeAddress}`,
            title: 'View transaction',
          },
          groupKey: txId,
        }),
      )
    }
  }, [chain?.shortName, dispatch, isGranted, notifications, safeAddress, txsAwaitingConfirmation])
}

export default useTxNotifications
