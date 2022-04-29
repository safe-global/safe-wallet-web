import React from 'react'
import { useSnackbar, type SnackbarKey } from 'notistack'

import { useAppDispatch, useAppSelector } from '@/store'
import { closeNotification, selectNotifications } from '@/store/notificationsSlice'

let enqueuedKeys: SnackbarKey[] = []

const useNotifier = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)

  React.useEffect(() => {
    for (const { key, message, options = {}, dismissed = false } of notifications) {
      // Dismiss the notification via Notistack
      if (dismissed) {
        closeSnackbar(key)
        continue
      }

      // If enqueued, do nothing
      if (enqueuedKeys.includes(key)) {
        continue
      }

      // Display the notification via Notistack
      enqueueSnackbar(message, {
        key,
        ...options,
        onClose: (event, reason, myKey) => {
          if (options.onClose) {
            options?.onClose(event, reason, myKey)
          }
        },
        onExited: (_, myKey) => {
          // Cleanup store/cache on notification close
          dispatch(closeNotification({ key: myKey }))
          enqueuedKeys = [...enqueuedKeys.filter((enqueuedKey) => enqueuedKey !== key)]
        },
      })

      // Cache the notification key of displayed notifications
      enqueuedKeys = [...enqueuedKeys, key]
    }
  }, [notifications, closeSnackbar, enqueueSnackbar, dispatch])
}

export default useNotifier
