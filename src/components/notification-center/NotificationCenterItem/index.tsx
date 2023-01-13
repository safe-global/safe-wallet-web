import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import InfoIcon from '@/public/images/notifications/info.svg'
import WarningIcon from '@/public/images/notifications/warning.svg'
import ErrorIcon from '@/public/images/notifications/error.svg'
import SuccessIcon from '@/public/images/notifications/success.svg'
import { NotificationLink } from '@/components/common/Notifications'
import type { AlertColor } from '@mui/material/Alert'
import type { ReactElement } from 'react'

import type { Notification } from '@/store/notificationsSlice'
import UnreadBadge from '@/components/common/UnreadBadge'
import { formatTimeInWords } from '@/utils/date'

import css from './styles.module.css'
import classnames from 'classnames'
import SvgIcon from '@mui/material/SvgIcon'

const VARIANT_ICONS = {
  error: ErrorIcon,
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
}

const getNotificationIcon = (variant: AlertColor): ReactElement => {
  return <SvgIcon component={VARIANT_ICONS[variant]} inheritViewBox color={variant} />
}

const NotificationCenterItem = ({
  isRead,
  variant,
  message,
  timestamp,
  link,
  handleClose,
}: Notification & { handleClose: () => void }): ReactElement => {
  const requiresAction = !isRead && !!link

  const secondaryText = (
    <span className={css.secondaryText}>
      <span>{formatTimeInWords(timestamp)}</span>
      <NotificationLink link={link} onClick={handleClose} />
    </span>
  )

  return (
    <ListItem className={classnames(css.item, { [css.requiresAction]: requiresAction })}>
      <ListItemAvatar className={css.avatar}>
        <UnreadBadge
          invisible={isRead}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {getNotificationIcon(variant)}
        </UnreadBadge>
      </ListItemAvatar>
      <ListItemText primary={message} secondary={secondaryText} />
    </ListItem>
  )
}

export default NotificationCenterItem
