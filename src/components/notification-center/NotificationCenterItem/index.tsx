import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import { NotificationLink } from '@/components/common/Notifications'
import type { AlertColor } from '@mui/material/Alert'
import type { ReactElement } from 'react'

import { Notification } from '@/store/notificationsSlice'
import UnreadBadge from '@/components/common/UnreadBadge'
import { formatTimeInWords } from '@/utils/date'

import css from './styles.module.css'
import classnames from 'classnames'

const VARIANT_ICONS = {
  error: ErrorOutlineOutlinedIcon,
  info: InfoOutlinedIcon,
  success: TaskAltOutlinedIcon,
  warning: WarningAmberOutlinedIcon,
}

const getNotificationIcon = (variant: AlertColor): ReactElement => {
  const Icon = VARIANT_ICONS[variant]
  return <Icon color={variant} />
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
    <div className={css.secondaryText}>
      <span>{formatTimeInWords(timestamp)}</span>
      <NotificationLink link={link} onClick={handleClose} />
    </div>
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
