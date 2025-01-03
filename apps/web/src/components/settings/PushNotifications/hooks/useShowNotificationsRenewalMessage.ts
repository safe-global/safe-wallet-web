import useSafeInfo from '@/hooks/useSafeInfo'
import { selectNotifications, showNotification } from '@/store/notificationsSlice'
import { useEffect, useMemo } from 'react'
import { useNotificationPreferences } from './useNotificationPreferences'
import useWallet from '@/hooks/wallets/useWallet'
import { useAppDispatch, useAppSelector } from '@/store'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { useIsNotificationsRenewalEnabled, useNotificationsTokenVersion } from './useNotificationsTokenVersion'
import { useNotificationsRenewal } from './useNotificationsRenewal'
import { NotificationsTokenVersion } from '@/services/push-notifications/preferences'
import { RENEWAL_NOTIFICATION_KEY } from '../constants'

/**
 * Hook to show a notification to renew the notifications token if needed.
 */
export const useShowNotificationsRenewalMessage = () => {
  const { safe, safeLoaded } = useSafeInfo()
  const { getPreferences } = useNotificationPreferences()
  const preferences = getPreferences(safe.chainId, safe.address.value)
  const wallet = useWallet()
  const dispatch = useAppDispatch()
  const isWrongChain = useIsWrongChain()
  const { safeTokenVersion, setTokenVersion } = useNotificationsTokenVersion()
  const isNotificationsRenewalEnabled = useIsNotificationsRenewalEnabled()
  const notifications = useAppSelector(selectNotifications)
  const { renewNotifications } = useNotificationsRenewal()

  // Check if a renewal notification is already present
  const hasNotificationMessage = useMemo(
    () => notifications.some((notification) => notification.groupKey === RENEWAL_NOTIFICATION_KEY),
    [notifications],
  )

  useEffect(() => {
    if (
      !!wallet &&
      !!preferences &&
      safeLoaded &&
      !isWrongChain &&
      !safeTokenVersion &&
      !hasNotificationMessage &&
      isNotificationsRenewalEnabled
    ) {
      dispatch(
        showNotification({
          message:
            'We’ve upgraded your notification experience. Sign this message to keep receiving important updates seamlessly.',
          variant: 'warning',
          groupKey: RENEWAL_NOTIFICATION_KEY,
          link: {
            onClick: renewNotifications,
            title: 'Sign',
          },
        }),
      )

      // Set the token version to V1 to avoid showing the notification again
      setTokenVersion(NotificationsTokenVersion.V1)
    }
  }, [
    dispatch,
    renewNotifications,
    preferences,
    safeLoaded,
    safe,
    safeTokenVersion,
    isWrongChain,
    hasNotificationMessage,
    wallet,
    setTokenVersion,
    isNotificationsRenewalEnabled,
  ])
}
