import { useEffect } from 'react'

import { formatError } from '@/utils/formatters'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'
import useSafeAddress from './useSafeAddress'
import { RecoveryEvent, RecoveryEventType, recoverySubscribe } from '@/services/recovery/recoveryEvents'

const RecoveryTxNotifications = {
  [RecoveryEvent.EXECUTING]: 'Confirm the execution in your wallet.',
  [RecoveryEvent.PROCESSING]: 'Validating...',
  [RecoveryEvent.PROCESSED]: 'Successfully validated. Querying...',
  [RecoveryEvent.REVERTED]: 'Reverted. Please check your gas settings.',
  [RecoveryEvent.FAILED]: 'Failed.',
}

const RecoveryTxNotificationTitles = {
  [RecoveryEventType.PROPOSAL]: 'Account recovery proposal',
  [RecoveryEventType.EXECUTION]: 'Account recovery',
  [RecoveryEventType.SKIP_EXPIRED]: 'Account recovery cancellation',
}

export function useRecoveryTxNotifications(): void {
  const dispatch = useAppDispatch()
  const safeAddress = useSafeAddress()

  /**
   * Show notifications of a recovery transaction's lifecycle
   */

  useEffect(() => {
    const unsubFns = Object.entries(RecoveryTxNotifications).map(([event, notification]) =>
      recoverySubscribe(event as RecoveryEvent, async (detail) => {
        const isSuccess = event === RecoveryEvent.PROCESSED
        const isError = 'error' in detail

        const title = RecoveryTxNotificationTitles[detail.eventType]
        const message = isError ? `${notification} ${formatError(detail.error)}` : notification
        const groupKey = 'recoveryTxHash' in detail ? detail.recoveryTxHash ?? '' : ''

        dispatch(
          showNotification({
            title,
            message,
            detailedMessage: isError ? detail.error.message : undefined,
            groupKey: groupKey,
            variant: isError ? 'error' : isSuccess ? 'success' : 'info',
          }),
        )
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [dispatch, safeAddress])
}
