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
      if (notification.dismissed) {
        closeSnackbar(notification.options?.key)
        continue
      }

      if (notification.options?.key && onScreenKeys.includes(notification.options.key)) {
        continue
      }

      const key = enqueueSnackbar(notification.message, {
        key: notification.options?.key,
        ...notification.options,
        // Run callback when notification is closing
        onClose: (event, reason, key) => {
          if (notification.options?.onClose) {
            notification.options.onClose(event, reason, key)
          }
        },
        onExited: (_, key) => {
          // Cleanup store/cache when notification has unmounted
          dispatch(closeNotification({ key }))
          onScreenKeys = onScreenKeys.filter((onScreenKey) => onScreenKey !== notification.options?.key)
        },
      })

      onScreenKeys = [...onScreenKeys, key]
    }
  }, [notifications, closeSnackbar, enqueueSnackbar, dispatch])
}

export default useNotifier
