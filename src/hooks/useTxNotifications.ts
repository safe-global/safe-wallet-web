import { useEffect, useMemo } from 'react'
import { formatError } from '@/utils/formatters'
import type { LinkProps } from 'next/link'
import { selectNotifications, showNotification } from '@/store/notificationsSlice'
import { useAppDispatch, useAppSelector } from '@/store'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { AppRoutes } from '@/config/routes'
import { useCurrentChain } from './useChains'
import useTxQueue from './useTxQueue'
import { isSignableBy, isTransactionListItem } from '@/utils/transaction-guards'
import { type ChainInfo, TransactionStatus } from '@safe-global/safe-gateway-typescript-sdk'
import { selectPendingTxs } from '@/store/pendingTxsSlice'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useWallet from './wallets/useWallet'
import useSafeAddress from './useSafeAddress'
import { getExplorerLink } from '@/utils/gateway'

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
  [TxEvent.ONCHAIN_SIGNATURE_REQUESTED]:
    'An on-chain signature is required. Please confirm the transaction in your wallet.',
  [TxEvent.ONCHAIN_SIGNATURE_SUCCESS]:
    "The on-chain signature request was confirmed. Once it's on chain, the transaction will be signed.",
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

const successEvents = [TxEvent.PROPOSED, TxEvent.SIGNATURE_PROPOSED, TxEvent.ONCHAIN_SIGNATURE_SUCCESS, TxEvent.SUCCESS]

const getTxLink = (txId: string, chain: ChainInfo, safeAddress: string): { href: LinkProps['href']; title: string } => {
  return {
    href: {
      pathname: AppRoutes.transactions.tx,
      query: { id: txId, safe: `${chain?.shortName}:${safeAddress}` },
    },
    title: 'View transaction',
  }
}

const getTxExplorerLink = (txHash: string, chain: ChainInfo): { href: LinkProps['href']; title: string } => {
  const { href } = getExplorerLink(txHash, chain.blockExplorerUriTemplate)
  return {
    href,
    title: 'View on explorer',
  }
}

const useTxNotifications = (): void => {
  const dispatch = useAppDispatch()
  const chain = useCurrentChain()
  const safeAddress = useSafeAddress()

  /**
   * Show notifications of a transaction's lifecycle
   */

  useEffect(() => {
    if (!chain) return

    const entries = Object.entries(TxNotifications) as [keyof typeof TxNotifications, string][]

    const unsubFns = entries.map(([event, baseMessage]) =>
      txSubscribe(event, (detail) => {
        const isError = 'error' in detail
        const isSuccess = successEvents.includes(event)
        const message = isError ? `${baseMessage} ${formatError(detail.error)}` : baseMessage
        const txId = 'txId' in detail ? detail.txId : undefined
        const txHash = 'txHash' in detail ? detail.txHash : undefined
        const groupKey = 'groupKey' in detail && detail.groupKey ? detail.groupKey : txId || ''

        dispatch(
          showNotification({
            message,
            detailedMessage: isError ? detail.error.message : undefined,
            groupKey,
            variant: isError ? Variant.ERROR : isSuccess ? Variant.SUCCESS : Variant.INFO,
            link: txId ? getTxLink(txId, chain, safeAddress) : txHash ? getTxExplorerLink(txHash, chain) : undefined,
          }),
        )
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [dispatch, safeAddress, chain])

  /**
   * If there's at least one transaction awaiting confirmations, show a notification for it
   */

  const { page } = useTxQueue()
  const isOwner = useIsSafeOwner()
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
    if (!isOwner || txsAwaitingConfirmation.length === 0) {
      return
    }

    const txId = txsAwaitingConfirmation[0].transaction.id
    const hasNotified = notifications.some(({ groupKey }) => groupKey === txId)

    if (!hasNotified) {
      dispatch(
        showNotification({
          variant: 'info',
          message: 'A transaction requires your confirmation.',
          link: chain && getTxLink(txId, chain, safeAddress),
          groupKey: txId,
        }),
      )
    }
  }, [chain, dispatch, isOwner, notifications, safeAddress, txsAwaitingConfirmation])
}

export default useTxNotifications
