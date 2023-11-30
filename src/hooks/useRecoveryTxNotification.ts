import { useEffect } from 'react'

import { formatError } from '@/utils/formatters'
import { selectNotifications, showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'
import useSafeAddress from './useSafeAddress'
import { RecoveryEvent, RecoveryEventType, recoverySubscribe } from '@/services/recovery/recoveryEvents'
import { getExplorerLink } from '@/utils/gateway'
import { useCurrentChain } from './useChains'
import { useSelector } from 'react-redux'

const RecoveryTxNotifications = {
  [RecoveryEvent.EXECUTING]: 'Confirm the execution in your wallet.',
  [RecoveryEvent.PROCESSING]: 'Validating...',
  [RecoveryEvent.PROCESSED]: 'Successfully validated. Loading...',
  [RecoveryEvent.REVERTED]: 'Reverted. Please check your gas settings.',
  [RecoveryEvent.FAILED]: 'Failed.',
  // TODO: Add success event
  // [RecoveryEvent.SUCCESS]: 'Successfully executed.',
}

const RecoveryTxNotificationTitles = {
  [RecoveryEventType.PROPOSAL]: 'Account recovery proposal',
  [RecoveryEventType.EXECUTION]: 'Account recovery',
  [RecoveryEventType.SKIP_EXPIRED]: 'Account recovery cancellation',
}

export function useRecoveryTxNotifications(): void {
  const dispatch = useAppDispatch()
  const chain = useCurrentChain()
  const safeAddress = useSafeAddress()

  const notifications = useSelector(selectNotifications)

  /**
   * Show notifications of a recovery transaction's lifecycle
   */

  useEffect(() => {
    if (!chain?.blockExplorerUriTemplate) {
      return
    }

    const unsubFns = Object.entries(RecoveryTxNotifications).map(([event, notification]) =>
      recoverySubscribe(event as RecoveryEvent, async (detail) => {
        const isSuccess = event === RecoveryEvent.PROCESSED
        const isError = 'error' in detail

        const txHash = 'txHash' in detail ? detail.txHash : undefined
        const recoveryTxHash = 'recoveryTxHash' in detail ? detail.recoveryTxHash : undefined
        const groupKey = txHash || recoveryTxHash || ''

        const title =
          'eventType' in detail
            ? RecoveryTxNotificationTitles[detail.eventType]
            : notifications.find((notification) => notification.groupKey === groupKey)?.title ||
              RecoveryTxNotificationTitles[RecoveryEventType.EXECUTION]
        const message = isError ? `${notification} ${formatError(detail.error)}` : notification

        const link = txHash ? getExplorerLink(txHash, chain.blockExplorerUriTemplate) : undefined

        dispatch(
          showNotification({
            title,
            message,
            detailedMessage: isError ? detail.error.message : undefined,
            groupKey: groupKey,
            variant: isError ? 'error' : isSuccess ? 'success' : 'info',
            link,
          }),
        )
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [dispatch, safeAddress, chain?.blockExplorerUriTemplate, notifications])
}
