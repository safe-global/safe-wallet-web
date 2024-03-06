import UnreadBadge from '@/components/common/UnreadBadge'
import NotificationCenterList from '@/components/notification-center/NotificationCenterList'
import { AppRoutes } from '@/config/routes'
import BellIcon from '@/public/images/common/notifications.svg'
import SettingsIcon from '@/public/images/sidebar/settings.svg'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  closeNotification,
  deleteAllNotifications,
  readNotification,
  selectNotifications,
} from '@/store/notificationsSlice'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import MuiLink from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo, useState, type MouseEvent, type ReactElement } from 'react'

import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import SvgIcon from '@mui/icons-material/ExpandLess'
import css from './styles.module.css'

const NOTIFICATION_CENTER_LIMIT = 4

const NotificationCenter = (): ReactElement => {
  const router = useRouter()
  const [showAll, setShowAll] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)

  const dispatch = useAppDispatch()

  const notifications = useAppSelector(selectNotifications)
  const chronologicalNotifications = useMemo(() => {
    // Clone as Redux returns read-only array
    return notifications.slice().sort((a, b) => b.timestamp - a.timestamp)
  }, [notifications])

  const canExpand = notifications.length > NOTIFICATION_CENTER_LIMIT + 1

  const notificationsToShow =
    showAll || !canExpand ? chronologicalNotifications : chronologicalNotifications.slice(0, NOTIFICATION_CENTER_LIMIT)

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

  const ExpandIcon = showAll ? ExpandLessIcon : ExpandMoreIcon

  return (
    <>
      <ButtonBase data-sid="25479" className={css.bell} onClick={handleClick}>
        <UnreadBadge
          invisible={!hasUnread}
          count={unreadCount}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <SvgIcon component={BellIcon} inheritViewBox fontSize="medium" />
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
        sx={{
          '& > .MuiPaper-root': {
            top: 'var(--header-height) !important',
          },
        }}
        transitionDuration={0}
      >
        <Paper className={css.popoverContainer}>
          <div data-sid="14123" className={css.popoverHeader}>
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
              <MuiLink onClick={handleClear} variant="body2" component="button" sx={{ textDecoration: 'unset' }}>
                Clear all
              </MuiLink>
            )}
          </div>
          <div>
            <NotificationCenterList notifications={notificationsToShow} handleClose={handleClose} />
          </div>
          <div data-sid="97948" className={css.popoverFooter}>
            {canExpand && (
              <>
                <IconButton onClick={() => setShowAll((prev) => !prev)} disableRipple className={css.expandButton}>
                  <UnreadBadge
                    invisible={showAll || unreadCount <= NOTIFICATION_CENTER_LIMIT}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                  >
                    <ExpandIcon color="border" />
                  </UnreadBadge>
                </IconButton>
                <Typography sx={{ color: ({ palette }) => palette.border.main }}>
                  {showAll ? 'Hide' : `${notifications.length - NOTIFICATION_CENTER_LIMIT} other notifications`}
                </Typography>
              </>
            )}
            <Link
              href={{
                pathname: AppRoutes.settings.notifications,
                query: router.query,
              }}
              passHref
              legacyBehavior
            >
              <MuiLink className={css.settingsLink} variant="body2" onClick={handleClose}>
                <SvgIcon component={SettingsIcon} inheritViewBox fontSize="small" /> Settings
              </MuiLink>
            </Link>
          </div>
        </Paper>
      </Popover>
    </>
  )
}

export default NotificationCenter
