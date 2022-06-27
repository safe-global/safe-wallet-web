import { SyntheticEvent, useCallback, useEffect } from 'react'
import groupBy from 'lodash/groupBy'
import { useAppDispatch, useAppSelector } from '@/store'
import { closeNotification, Notification, selectNotifications } from '@/store/notificationsSlice'
import { Alert, AlertColor, Snackbar } from '@mui/material'
import css from './styles.module.css'

const toastStyle = { position: 'static', margin: 1 }

const Toast = ({ message, severity, onClose }: { message: string; severity: AlertColor; onClose: () => void }) => {
  const handleClose = (_: Event | SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') return
    onClose()
  }

  return (
    <Snackbar open={true} onClose={handleClose} sx={toastStyle}>
      <Alert severity={severity} onClose={handleClose}>
        {message}
      </Alert>
    </Snackbar>
  )
}

const Notifications = () => {
  const notifications = useAppSelector(selectNotifications)
  const dispatch = useAppDispatch()
  const visible = notifications.filter((item) => !item.dismissed)

  const handleClose = useCallback(
    (item: Notification) => {
      dispatch(closeNotification(item))
    },
    [dispatch],
  )

  // Close previous notifications in the same group
  useEffect(() => {
    const groups: Record<string, Notification[]> = groupBy(notifications, 'groupKey')

    Object.values(groups).forEach((items) => {
      const previous = items.filter((item) => !item.dismissed).slice(0, -1)
      previous.forEach(handleClose)
    })
  }, [notifications, handleClose])

  return (
    <div className={css.container}>
      {visible.map((item) => (
        <div className={css.row} key={item.id}>
          <Toast
            message={item.message}
            severity={(item.variant as AlertColor) || 'info'}
            onClose={() => handleClose(item)}
          />
        </div>
      ))}
    </div>
  )
}

export default Notifications
