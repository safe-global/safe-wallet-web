import { useState, useMemo, type ReactElement, type MouseEvent } from 'react'
import ButtonBase from '@mui/material/ButtonBase'
import Popover from '@mui/material/Popover'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectNotifications,
  readNotification,
  closeNotification,
  deleteAllNotifications,
} from '@/store/notificationsSlice'
import NotificationCenterList from '@/components/notification-center/NotificationCenterList'
import UnreadBadge from '@/components/common/UnreadBadge'

import css from './styles.module.css'
import { trackEvent, OVERVIEW_EVENTS } from '@/services/analytics'

const NOTIFICATION_CENTER_LIMIT = 4

const NotificationCenter = (): ReactElement => {
  const [showAll, setShowAll] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)

  const dispatch = useAppDispatch()

  const notifications = useAppSelector(selectNotifications)
  const chronologicalNotifications = useMemo(() => {
    // Clone as Redux returns read-only array
    return notifications.slice().sort((a, b) => b.timestamp - a.timestamp)
  }, [notifications])

  const canExpand = notifications.length > NOTIFICATION_CENTER_LIMIT

  const notificationsToShow =
    canExpand && showAll ? chronologicalNotifications : chronologicalNotifications.slice(0, NOTIFICATION_CENTER_LIMIT)

  const unreadCount = useMemo(() => notifications.filter(({ isRead }) => !isRead).length, [notifications])
  const hasUnread = unreadCount > 0

  const handleRead = () => {
    notificationsToShow.forEach(({ isRead, id }) => {
      if (!isRead) {
        dispatch(readNotification({ id }))
      }
    })
    setShowAll(false)
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!open) {
      trackEvent(OVERVIEW_EVENTS.NOTIFICATION_CENTER)

      notifications.forEach(({ isDismissed, id }) => {
        if (!isDismissed) {
          dispatch(closeNotification({ id }))
        }
      })
    } else {
      handleRead()
    }
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    if (open) {
      handleRead()
      setShowAll(false)
    }
    setAnchorEl(null)
  }

  const handleClear = () => {
    dispatch(deleteAllNotifications())
  }

  return (
    <>
      <ButtonBase disableRipple className={css.bell} onClick={handleClick}>
        <UnreadBadge
          invisible={!hasUnread}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <NotificationsNoneOutlinedIcon sx={({ palette }) => ({ color: palette.secondary.light })} />
        </UnreadBadge>
      </ButtonBase>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        elevation={3}
        sx={{ mt: 1 }}
      >
        <Paper className={css.popoverContainer}>
          <div className={css.popoverHeader}>
            <div>
              <Typography variant="h4" component="span" fontWeight={700}>
                Notifications
              </Typography>
              {hasUnread && (
                <Typography variant="caption" className={css.unreadCount}>
                  {unreadCount}
                </Typography>
              )}
            </div>
            {notifications.length > 0 && (
              <Button variant="text" size="small" onClick={handleClear}>
                Clear all
              </Button>
            )}
          </div>
          <div>
            <NotificationCenterList notifications={notificationsToShow} handleClose={handleClose} />
          </div>
          {canExpand && (
            <div className={css.popoverFooter}>
              <IconButton onClick={() => setShowAll((prev) => !prev)} disableRipple className={css.expandButton}>
                <UnreadBadge
                  invisible={unreadCount <= NOTIFICATION_CENTER_LIMIT}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  {showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </UnreadBadge>
              </IconButton>
              <Typography sx={{ color: ({ palette }) => palette.border.main }}>
                {showAll ? 'Hide' : `${notifications.length - NOTIFICATION_CENTER_LIMIT} other notifications`}
              </Typography>
            </div>
          )}
        </Paper>
      </Popover>
    </>
  )
}

export default NotificationCenter
