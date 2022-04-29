import { useEffect } from 'react'
import { useSnackbar, type SnackbarKey } from 'notistack'

import { useAppDispatch, useAppSelector } from '@/store'
import { closeNotification, selectNotifications } from '@/store/notificationsSlice'

let onScreenKeys: SnackbarKey[] = []

const useNotifier = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)

  useEffect(() => {
    for (const notification of notifications) {
      // Dismiss the notification via Notistack
      if (notification.dismissed) {
        closeSnackbar(notification.key)
        continue
      }

      // If on screen, do nothing
      if (onScreenKeys.includes(notification.key)) {
        continue
      }

      // Display the notification via Notistack
      enqueueSnackbar(notification.message, {
        key: notification.key,
        ...notification.options,
        onClose: (event, reason, key) => {
          if (notification.options?.onClose) {
            notification.options.onClose(event, reason, key)
          }
        },
        onExited: (_, key) => {
          // Cleanup store/cache on notification close
          dispatch(closeNotification({ key }))
          onScreenKeys = onScreenKeys.filter((onScreenKey) => onScreenKey !== notification.key)
        },
      })

      // Cache the notification key of displayed notifications
      onScreenKeys = [...onScreenKeys, notification.key]
    }
  }, [notifications, closeSnackbar, enqueueSnackbar, dispatch])
}

export default useNotifier
