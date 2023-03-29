import type { ReactElement, SyntheticEvent } from 'react'
import { useCallback, useEffect } from 'react'
import groupBy from 'lodash/groupBy'
import { useAppDispatch, useAppSelector } from '@/store'
import type { Notification } from '@/store/notificationsSlice'
import { closeNotification, readNotification, selectNotifications } from '@/store/notificationsSlice'
import type { AlertColor, SnackbarCloseReason } from '@mui/material'
import { Alert, Link, Snackbar } from '@mui/material'
import css from './styles.module.css'
import NextLink from 'next/link'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import Track from '../Track'
import { isRelativeUrl } from '@/utils/url'

const toastStyle = { position: 'static', margin: 1 }

export const NotificationLink = ({
  link,
  onClick,
}: {
  link: Notification['link']
  onClick: (_: Event | SyntheticEvent) => void
}): ReactElement | null => {
  if (!link) {
    return null
  }

  const isExternal =
    typeof link.href === 'string' ? !isRelativeUrl(link.href) : !!(link.href.host || link.href.hostname)

  return (
    <Track {...OVERVIEW_EVENTS.NOTIFICATION_INTERACTION} label={link.title} as="span">
      <NextLink href={link.href} passHref>
        <Link
          className={css.link}
          onClick={onClick}
          {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {link.title} <ChevronRightIcon />
        </Link>
      </NextLink>
    </Track>
  )
}

const Toast = ({
  message,
  detailedMessage,
  variant,
  link,
  onClose,
  id,
}: {
  variant: AlertColor
  onClose: () => void
} & Notification) => {
  const dispatch = useAppDispatch()

  const handleClose = (_: Event | SyntheticEvent, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return

    // Manually closed
    if (!reason) {
      dispatch(readNotification({ id }))
    }

    onClose()
  }

  const autoHideDuration = variant === 'info' || variant === 'success' ? 5000 : undefined

  return (
    <Snackbar open onClose={handleClose} sx={toastStyle} autoHideDuration={autoHideDuration}>
      <Alert severity={variant} onClose={handleClose} elevation={3} sx={{ width: '340px' }}>
        {message}

        {detailedMessage && (
          <details>
            <Link component="summary">Details</Link>
            <pre>{detailedMessage}</pre>
          </details>
        )}
        <NotificationLink link={link} onClick={handleClose} />
      </Alert>
    </Snackbar>
  )
}

const getVisibleNotifications = (notifications: Notification[]) => {
  return notifications.filter((notification) => !notification.isDismissed)
}

const Notifications = (): ReactElement | null => {
  const notifications = useAppSelector(selectNotifications)
  const dispatch = useAppDispatch()

  const visible = getVisibleNotifications(notifications)

  const handleClose = useCallback(
    (item: Notification) => {
      dispatch(closeNotification(item))
      item.onClose?.()
    },
    [dispatch],
  )

  // Close previous notifications in the same group
  useEffect(() => {
    const groups: Record<string, Notification[]> = groupBy(notifications, 'groupKey')

    Object.values(groups).forEach((items) => {
      const previous = getVisibleNotifications(items).slice(0, -1)
      previous.forEach(handleClose)
    })
  }, [notifications, handleClose])

  if (!visible.length) {
    return null
  }

  return (
    <div className={css.container}>
      {visible.map((item) => (
        <div className={css.row} key={item.id}>
          <Toast {...item} onClose={() => handleClose(item)} />
        </div>
      ))}
    </div>
  )
}

export default Notifications
