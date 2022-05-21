import { useEffect } from 'react'
import { useSnackbar, type SnackbarKey } from 'notistack'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import { useAppDispatch, useAppSelector } from '@/store'
import { closeNotification, selectNotifications } from '@/store/notificationsSlice'

let onScreenKeys: SnackbarKey[] = []

const useNotifier = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)

  useEffect(() => {
    for (const notification of notifications) {
      const key = notification.options?.key ?? ''

      if (notification.dismissed) {
        closeSnackbar(key)
        continue
      }

      if (key && onScreenKeys.includes(key)) {
        continue
      }

      enqueueSnackbar(notification.message, {
        key,
        action: (
          <IconButton onClick={() => dispatch(closeNotification({ key }))}>
            <CloseIcon />
          </IconButton>
        ),
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
          onScreenKeys = onScreenKeys.filter((onScreenKey) => onScreenKey !== key)
        },
      })

      onScreenKeys = [...onScreenKeys, key]
    }
  }, [notifications, closeSnackbar, enqueueSnackbar, dispatch])
}

export default useNotifier
